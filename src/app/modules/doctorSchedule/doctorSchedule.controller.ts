import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import { DoctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import httpStatus from "http-status";
import { doctorScheduleFilterableFields, myScheduleFilterableFields } from "./doctorSchedule.constant";

const createDoctorSchedule = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;

  const result = await DoctorScheduleService.createDoctorSchedule(user as IJWTPayload, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Schedule created Successfully",
    data: result,
  });
});

// GET ALL DOCTOR SCHEDULES (ADMIN ONLY)
const getAllDoctorSchedules = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const filters = pick(req.query, doctorScheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorScheduleService.getAllDoctorSchedules(user as IJWTPayload, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All doctor schedules retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// GET MY DOCTOR SCHEDULES (DOCTOR ONLY)
const getMySchedules = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const filters = pick(req.query, myScheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorScheduleService.getMySchedules(user as IJWTPayload, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My schedules retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// DELETE DOCTOR SCHEDULE BY ID (DOCTOR ONLY)
const deleteSchedule = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  const result = await DoctorScheduleService.deleteSchedule(user!, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const DoctorScheduleController = {
  createDoctorSchedule,
  getAllDoctorSchedules,
  getMySchedules,
  deleteSchedule,
};
