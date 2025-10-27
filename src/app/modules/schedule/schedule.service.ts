import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";

const insertIntoDB = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;

  const intervalTime = 30;
  const schedules: any[] = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  // OUTER LOOP - For each date
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])),
        Number(endTime.split(":")[1])
      )
    );

    //INNER LOOP - For each time slot of the day
    while (startDateTime <= endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);

      const scheduleDate = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleDate,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleDate,
        });
        schedules.push(result);
      }
      slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

export const ScheduleService = {
  insertIntoDB,
};
