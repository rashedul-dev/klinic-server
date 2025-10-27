import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { filterByStartAndEndDate, schedulePagination } from "./schedule.constant";
import { IJWTPaylaod } from "../../types/common";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully",
    data: result,
  });
});
const schedulesForDoctor = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const filters = pick(req.query, filterByStartAndEndDate);
  const options = pick(req.query, schedulePagination);

  const user = req.user;
  const result = await ScheduleService.scheduleForDoctor(user as IJWTPaylaod, filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule retrived Successfully",
    data: result,
  });
});
const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.deleteSchedule(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule Deleted Successfully",
    data: result,
  });
});

export const ScheduleController = {
  insertIntoDB,
  schedulesForDoctor,
  deleteSchedule,
};
