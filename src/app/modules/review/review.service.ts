import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { Prisma } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";

const createReview = async (user: IJWTPayload, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findFirstOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (patientData.id !== appointmentData.patientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your Appointment");
  }
  if (appointmentData.status !== "COMPLETED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please, Finished Your Appointment");
  }

  return await prisma.$transaction(async (tnx) => {
    const result = await tnx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });
    const avgRating = await tnx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });
    await tnx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: avgRating._avg.rating as number,
      },
    });

    return result;
  });
};

// GET ALL REVIEWS (PUBLIC)
const getAllReviews = async (options: IOptions, filters: any = {}) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const andConditions: any[] = [];

  // Search functionality
  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        {
          patient: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          doctor: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          comment: {
            contains: filters.searchTerm,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
      ],
    });
  }

  // Filter by doctor ID
  if (filters.doctorId) {
    andConditions.push({
      doctorId: filters.doctorId,
    });
  }

  // Filter by patient ID
  if (filters.patientId) {
    andConditions.push({
      patientId: filters.patientId,
    });
  }

  // Filter by rating
  if (filters.rating) {
    andConditions.push({
      rating: parseInt(filters.rating),
    });
  }

  // Filter by rating range
  if (filters.minRating && filters.maxRating) {
    andConditions.push({
      rating: {
        gte: parseInt(filters.minRating),
        lte: parseInt(filters.maxRating),
      },
    });
  } else if (filters.minRating) {
    andConditions.push({
      rating: {
        gte: parseInt(filters.minRating),
      },
    });
  } else if (filters.maxRating) {
    andConditions.push({
      rating: {
        lte: parseInt(filters.maxRating),
      },
    });
  }

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      },
    });
  } else if (filters.startDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(filters.startDate),
      },
    });
  } else if (filters.endDate) {
    andConditions.push({
      createdAt: {
        lte: new Date(filters.endDate),
      },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.review.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            qualification: true,
            currentWorkingPlace: true,
            designation: true,
            doctorSpecialties: {
              include: {
                specialities: true,
              },
            },
            averageRating: true,
          },
        },
        appointment: {
          select: {
            id: true,
            schedule: {
              select: {
                startDateTime: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({
      where: whereConditions,
    }),
  ]);

  // Calculate average rating for the filtered results
  const averageRating = await prisma.review.aggregate({
    where: whereConditions,
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
    // summary: {
    //   averageRating: averageRating._avg.rating || 0,
    //   totalReviews: averageRating._count.rating || 0,
    // },
  };
};

// GET REVIEWS BY DOCTOR ID (PUBLIC)
const getReviewsByDoctorId = async (doctorId: string, options: IOptions, filters: any = {}) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const andConditions: any[] = [];

  // Filter by rating
  if (filters.rating) {
    andConditions.push({
      rating: parseInt(filters.rating),
    });
  }

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.review.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        appointment: {
          select: {
            id: true,
            schedule: {
              select: {
                startDateTime: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({
      where: whereConditions,
    }),
  ]);

  // Calculate doctor's average rating
  const doctorStats = await prisma.review.aggregate({
    where: whereConditions,
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
    summary: {
      averageRating: doctorStats._avg.rating || 0,
      totalReviews: doctorStats._count.rating || 0,
    },
  };
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewsByDoctorId,
};
