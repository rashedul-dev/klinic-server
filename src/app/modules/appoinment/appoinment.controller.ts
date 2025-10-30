import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPaylaod } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appoinment.service";

const createAppointment = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const result = await AppointmentService.createAppointment(user as IJWTPaylaod, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Appointment created successfully!",
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
};
