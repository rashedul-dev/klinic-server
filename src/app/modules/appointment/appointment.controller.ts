import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPaylaod } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import pick from "../../helper/pick";
import { appointmentFilters, appointmentPagination } from "./appointment.constant";

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
const getMyAppointment = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const options = pick(req.query, appointmentPagination);
  const filters = pick(req.query, appointmentFilters);
  const user = req.user;
  const result = await AppointmentService.getMyAppointment(user as IJWTPaylaod, filters, options);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Appointment Retrieved successfully!",
    data: result,
  });
});
const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = req.user;
  const result = await AppointmentService.updateAppointmentStatus(id, status, user as IJWTPaylaod);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment Updated Successfully!",
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
};
