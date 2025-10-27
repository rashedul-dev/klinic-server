import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPaylaod } from "../../types/common";
import { DoctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../shared/sendResponse";

const createDoctorSchedule = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;

  const result = await DoctorScheduleService.createDoctorSchedule(user as IJWTPaylaod, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Schedule created Successfully",
    data: result,
  });
});
export const DoctorScheduleController = {
  createDoctorSchedule,
};
