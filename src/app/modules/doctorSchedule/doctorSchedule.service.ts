import { Prisma, UserRole } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import httpStatus from "http-status";

const createDoctorSchedule = async (
  user: IJWTPayload,
  payload: {
    scheduleIds: string[];
  }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const createDoctorScheduleData = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  return createDoctorScheduleData;
};

// GET ALL DOCTOR SCHEDULES (ADMIN ONLY)
const getAllDoctorSchedules = async (user: IJWTPayload, options: IOptions, filters: any = {}) => {
  // Verify admin access
  if (user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only administrators can access all doctor schedules");
  }

  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const andConditions: any[] = [];

  // Search functionality
  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        {
          doctor: {
            name: {
              contains: filters.searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          doctor: {
            email: {
              contains: filters.searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
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

  // Filter by schedule status
  if (filters.isBooked) {
    andConditions.push({
      isBooked: filters.isBooked === "true",
    });
  }

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      },
    });
  } else if (filters.startDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(filters.startDate),
        },
      },
    });
  } else if (filters.endDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          lte: new Date(filters.endDate),
        },
      },
    });
  }

  // Filter by upcoming/past schedules
  if (filters.type === "upcoming") {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(),
        },
      },
    });
  } else if (filters.type === "past") {
    andConditions.push({
      schedule: {
        startDateTime: {
          lt: new Date(),
        },
      },
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.doctorSchedules.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            qualification: true,
            currentWorkingPlace: true,
            designation: true,
            doctorSpecialties: {
              include: {
                specialities: true,
              },
            },
          },
        },
        schedule: {
          select: {
            id: true,
            startDateTime: true,
            endDateTime: true,
            appointments: {
              select: {
                id: true,
                status: true,
                patient: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.doctorSchedules.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

// GET MY DOCTOR SCHEDULES (DOCTOR ONLY)
const getMySchedules = async (user: IJWTPayload, options: IOptions, filters: any = {}) => {
  // Verify doctor access
  if (user.role !== UserRole.DOCTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only doctors can access their schedules");
  }

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const andConditions: any[] = [
    {
      doctorId: doctor.id,
    },
  ];

  // Filter by schedule status
  if (filters.isBooked !== undefined) {
    andConditions.push({
      isBooked: filters.isBooked === "true",
    });
  }

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      },
    });
  } else if (filters.startDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(filters.startDate),
        },
      },
    });
  } else if (filters.endDate) {
    andConditions.push({
      schedule: {
        startDateTime: {
          lte: new Date(filters.endDate),
        },
      },
    });
  }

  // Filter by upcoming/past schedules
  if (filters.type === "upcoming") {
    andConditions.push({
      schedule: {
        startDateTime: {
          gte: new Date(),
        },
      },
    });
  } else if (filters.type === "past") {
    andConditions.push({
      schedule: {
        startDateTime: {
          lt: new Date(),
        },
      },
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.doctorSchedules.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        schedule: {
          select: {
            id: true,
            startDateTime: true,
            endDateTime: true,
            appointments: {
              select: {
                id: true,
                status: true,
                patient: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.doctorSchedules.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

// DELETE DOCTOR SCHEDULE BY ID (DOCTOR ONLY)
const deleteSchedule = async (user: IJWTPayload, scheduleId: string) => {
  // Verify doctor access
  if (user.role !== UserRole.DOCTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only doctors can delete their schedules");
  }

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  // Check if schedule exists and belongs to the doctor
  const doctorSchedule = await prisma.doctorSchedules.findFirst({
    where: {
      scheduleId: scheduleId,
      doctorId: doctor.id,
    },
    include: {
      schedule: {
        include: {
          appointments: true,
        },
      },
    },
  });

  if (!doctorSchedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Schedule not found or you don't have permission to delete it");
  }

  // Check if schedule has any appointments
  if (doctorSchedule.schedule.appointments && doctorSchedule.schedule.appointments.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete schedule with existing appointments. Please cancel appointments first."
    );
  }

  // Check if schedule is in the past
  if (doctorSchedule.schedule.startDateTime < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot delete past schedules");
  }

  // Delete the doctor schedule relation
  const deletedDoctorSchedule = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctor.id,
        scheduleId: scheduleId,
      },
    },
  });

  // Also delete the schedule if no other doctors are using it
  const remainingDoctorSchedules = await prisma.doctorSchedules.count({
    where: {
      scheduleId: scheduleId,
    },
  });

  if (remainingDoctorSchedules === 0) {
    await prisma.schedule.delete({
      where: {
        id: scheduleId,
      },
    });
  }

  return deletedDoctorSchedule;
};

export const DoctorScheduleService = {
  createDoctorSchedule,
  getAllDoctorSchedules,
  getMySchedules,
  deleteSchedule,
};
