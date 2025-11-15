import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
  }

  const hashPassword = await bcrypt.hash(req.body.password, 10);

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};
const getAllFormDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,

    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    omit: {
      password: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getMyProfile = async (user: IJWTPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let proifleData;

  if (userInfo.role === UserRole.PATIENT) {
    proifleData = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    proifleData = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    proifleData = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return {
    ...userInfo,
    ...proifleData,
  };
};
const updateProfileStatus = async (id: string, payload: { status: UserStatus }) => {
  // check if user exist
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const updatedUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });
  return updatedUserStatus;
};

// UPDATE MY PROFILE (ADMIN, DOCTOR, PATIENT)
const updateMyProfile = async (user: IJWTPayload, payload: any) => {
  // Find the user
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      // isDeleted: false,
    },
  });

  let result;

  // Update based on user role
  switch (user.role) {
    case UserRole.ADMIN:
      result = await updateAdminProfile(userInfo.email, payload);
      break;

    case UserRole.DOCTOR:
      result = await updateDoctorProfile(userInfo.email, payload);
      break;

    case UserRole.PATIENT:
      result = await updatePatientProfile(userInfo.email, payload);
      break;

    default:
      throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role");
  }

  return result;
};

// UPDATE ADMIN PROFILE
const updateAdminProfile = async (email: string, payload: any) => {
  const { profilePhoto, contactNumber, ...adminData } = payload;

  const result = await prisma.admin.update({
    where: {
      email,
    },
    data: {
      ...adminData,
      profilePhoto,
      contactNumber,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          needPasswordChange: true,
        },
      },
    },
  });

  return result;
};

// UPDATE DOCTOR PROFILE
const updateDoctorProfile = async (email: string, payload: any) => {
  const {
    profilePhoto,
    contactNumber,
    address,
    registrationNumber,
    experience,
    gender,
    appointmentFee,
    qualification,
    currentWorkingPlace,
    designation,
    doctorSpecialties, // Handle specialties separately if needed
    ...doctorData
  } = payload;

  const result = await prisma.doctor.update({
    where: {
      email,
      isDeleted: false,
    },
    data: {
      ...doctorData,
      profilePhoto,
      contactNumber,
      address,
      registrationNumber,
      experience: experience ? parseInt(experience) : undefined,
      gender,
      appointmentFee: appointmentFee ? parseInt(appointmentFee) : undefined,
      qualification,
      currentWorkingPlace,
      designation,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          needPasswordChange: true,
        },
      },
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  return result;
};

// UPDATE PATIENT PROFILE
const updatePatientProfile = async (email: string, payload: any) => {
  const {
    profilePhoto,
    contactNumber,
    address,
    patientHealthData, // Handle health data separately
    ...patientData
  } = payload;

  const result = await prisma.patient.update({
    where: {
      email,
      isDeleted: false,
    },
    data: {
      ...patientData,
      profilePhoto,
      contactNumber,
      address,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          needPasswordChange: true,
        },
      },
      patientHealthData: true,
    },
  });

  // Update patient health data if provided
  if (patientHealthData) {
    await prisma.patientHealthData.upsert({
      where: {
        patientId: result.id,
      },
      update: patientHealthData,
      create: {
        ...patientHealthData,
        patientId: result.id,
      },
    });
  }

  // Return updated patient with health data
  const updatedPatient = await prisma.patient.findUnique({
    where: {
      id: result.id,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          needPasswordChange: true,
        },
      },
      patientHealthData: true,
    },
  });

  return updatedPatient;
};
export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFormDB,
  getMyProfile,
  updateProfileStatus,
  updateMyProfile,
};
