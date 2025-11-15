import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import stripe from "../../shared/stripe";
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createAppointment = async (user: IJWTPayload, payload: { doctorId: string; scheduleId: string }) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const isBooked = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();

    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `https://www.programming-hero.com/`,
      cancel_url: `https://next.programming-hero.com/`,
    });
    console.log(session);
    return { paymentUrl: session.url };
  });

  return result;
};

const getMyAppointment = async (user: IJWTPayload, filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { ...filtersData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }

  if (Object.keys(filtersData).length > 0) {
    const filterConditions = Object.keys(filtersData).map((key) => ({
      [key]: {
        equals: (filtersData as any)[key],
      },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      limit,
      page,
    },
    data: result,
  };
};

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: IJWTPayload) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });
  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appiontment");
    }
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
};

// GET ALL APPOINTMENTS (ADMIN ONLY)
const getAllAppointments = async (user: IJWTPayload, options: IOptions, filters: any = {}) => {
  // Verify admin access
  if (user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only administrators can access all appointments");
  }

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
          patient: {
            email: {
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

  // Filter by status
  if (filters.status) {
    andConditions.push({
      status: filters.status,
    });
  }

  // Filter by payment status
  if (filters.paymentStatus) {
    andConditions.push({
      paymentStatus: filters.paymentStatus,
    });
  }

  // Filter by patient ID
  if (filters.patientId) {
    andConditions.push({
      patientId: filters.patientId,
    });
  }

  // Filter by doctor ID
  if (filters.doctorId) {
    andConditions.push({
      doctorId: filters.doctorId,
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

  const whereConditions: Prisma.AppointmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.appointment.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
        prescription: true,
      },
    }),
    prisma.appointment.count({
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

export const AppointmentService = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllAppointments,
};
