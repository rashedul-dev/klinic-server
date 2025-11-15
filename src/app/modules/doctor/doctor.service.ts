import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { openai } from "../../helper/open-router";
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage";

const getAllDoctor = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((filed) => ({
        [filed]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateDoctor = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyIds = specialties.filter((specialty) => specialty.isDeleted);

      for (const specialty of deleteSpecialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }

      const createSpecialtyIds = specialties.filter((specialty) => !specialty.isDeleted);

      for (const specialty of createSpecialtyIds) {
        await tnx.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }

    const updatedData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },

      //  doctor - doctorSpecailties - specialities
    });

    return updatedData;
  });
};

const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
  return result;
};

const deleteDoctor = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: deleteDoctor.email,
      },
    });
    return deleteDoctor;
  });
};
const softDeleteDoctor = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deleteDoctor;
  });
};

const getDoctorSuggestion = async (payload: { symptoms: string }) => {
  console.log("Received payload:", payload);

  // Better validation
  if (!payload?.symptoms?.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Symptoms are required");
  }

  // Fetch only available doctors and limit fields
  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  if (doctors.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No doctors available");
  }

  console.log(`Loaded ${doctors.length} doctors for analysis\n`);

  // prompt with clearer instructions
  const prompt = `
You are a medical assistant AI. Analyze the patient's symptoms and recommend the top 3 most relevant doctors from the list.

PATIENT SYMPTOMS: ${payload.symptoms}

AVAILABLE DOCTORS (JSON):
${JSON.stringify(doctors, null, 2)}

INSTRUCTIONS:
- Analyze the symptoms and match with doctor specialties
- Select only doctors whose specialties are relevant to the symptoms
- Return exactly 3 doctors (or less if not enough matches)
- Return in JSON format with full doctor objects
- Include a brief reason for each recommendation

RESPONSE FORMAT:
{
  "suggestedDoctors": [
    { 
      "doctor": { ...full doctor data... },
      "matchReason": "Brief explanation why this doctor is suitable"
    }
  ]
}
`;

  console.log("Analyzing symptoms and finding matches...\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI medical assistant that provides accurate doctor suggestions based on symptoms and specialties.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = completion.choices[0]?.message;

    if (!aiResponse?.content) {
      throw new Error("No response from AI service");
    }

    console.log("AI analysis completed");
    console.log("Raw AI response:", aiResponse.content);

    const result = await extractJsonFromMessage(aiResponse);
    return result;
  } catch (error) {
    console.error("Error in AI processing:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to generate doctor suggestions");
  }
};

export const DoctorService = {
  getAllDoctor,
  updateDoctor,
  getDoctorById,
  deleteDoctor,
  softDeleteDoctor,
  getDoctorSuggestion,
};
