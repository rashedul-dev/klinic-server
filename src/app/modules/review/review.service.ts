import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";

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

export const ReviewService = {
  createReview,
};
