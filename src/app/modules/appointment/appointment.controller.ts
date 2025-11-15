import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import pick from "../../helper/pick";
import { appointmentFilterableFields, appointmentPagination } from "./appointment.constant";
import httpStatus from "http-status";

const createAppointment = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const result = await AppointmentService.createAppointment(user as IJWTPayload, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Appointment created successfully!",
    data: result,
  });
});
const getMyAppointment = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const options = pick(req.query, appointmentPagination);
  const filters = pick(req.query, appointmentFilterableFields);
  const user = req.user;
  const result = await AppointmentService.getMyAppointment(user as IJWTPayload, filters, options);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Appointment Retrieved successfully!",
    data: result,
  });
});
const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = req.user;
  const result = await AppointmentService.updateAppointmentStatus(id, status, user as IJWTPayload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment Updated Successfully!",
    data: result,
  });
});
const getAllAppointments = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await AppointmentService.getAllAppointments(user!, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All appointments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllAppointments,
};
