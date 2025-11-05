import { AppointmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client";
import { IJWTPaylaod } from "../../types/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createPrescription = async (user: IJWTPaylaod, payload: Partial<Prescription>) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This is not your Appointment");
    }
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });
  return result;
};

// GET MY PRESCRIPTION AS A PATIENT
const getMyPrescriptions = async (user: IJWTPaylaod) => {
  if (user.role !== UserRole.PATIENT) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only patients can access their prescriptions");
  }

  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const result = await prisma.prescription.findMany({
    where: {
      patientId: patient.id,
    },
    include: {
      doctor: {
        select: {
          name: true,
          doctorSpecialties: true,
        },
      },
      appointment: {
        select: {
          schedule: {
            select: {
              startDateTime: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

// GET ALL PRESCRIPTIONS (FOR ADMIN/DOCTOR)
const getAllPrescriptions = async (user: IJWTPaylaod) => {
  let whereCondition = {};

  if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    whereCondition = {
      doctorId: doctor.id,
    };
  }

  const result = await prisma.prescription.findMany({
    where: whereCondition,
    include: {
      patient: {
        select: {
          name: true,
          email: true,
        },
      },
      doctor: {
        select: {
          name: true,
          doctorSpecialties: true,
        },
      },
      appointment: {
        select: {
          schedule: {
            select: {
              startDateTime: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

// GET SINGLE PRESCRIPTION BY ID
const getPrescriptionById = async (user: IJWTPaylaod, prescriptionId: string) => {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          doctorSpecialties: true,
        },
      },
      appointment: {
        select: {
          schedule: {
            select: {
              startDateTime: true,
            },
          },
        },
      },
    },
  });

  // Authorization check
  if (user.role === UserRole.PATIENT) {
    const patient = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    if (prescription.patientId !== patient.id) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }
  } else if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    if (prescription.doctorId !== doctor.id) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }
  }

  return prescription;
};

// UPDATE PRESCRIPTION
const updatePrescription = async (user: IJWTPaylaod, prescriptionId: string, payload: Partial<Prescription>) => {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
    },
  });

  // Authorization - only the prescribing doctor can update
  if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    if (prescription.doctorId !== doctor.id) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only update your own prescriptions");
    }
  }

  const result = await prisma.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: {
      instructions: payload.instructions,
      followUpDate: payload.followUpDate,
    },
    include: {
      patient: {
        select: {
          name: true,
          email: true,
        },
      },
      doctor: {
        select: {
          name: true,
          doctorSpecialties: true,
        },
      },
    },
  });

  return result;
};

// DELETE PRESCRIPTION
const deletePrescription = async (user: IJWTPaylaod, prescriptionId: string) => {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
  });

  // Authorization - only admin or the prescribing doctor can delete
  if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
    if (prescription.doctorId !== doctor.id) {
      throw new ApiError(httpStatus.FORBIDDEN, "You can only delete your own prescriptions");
    }
  }

  const result = await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });

  return result;
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
