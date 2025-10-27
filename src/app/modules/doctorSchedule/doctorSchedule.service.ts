import { prisma } from "../../shared/prisma";
import { IJWTPaylaod } from "../../types/common";

const createDoctorSchedule = async (
  user: IJWTPaylaod,
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

export const DoctorScheduleService = {
  createDoctorSchedule,
};
