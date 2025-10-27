import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { filterByStartAndEndDate, schedulePagination } from "./schedule.constant";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully",
    data: result,
  });
});
const schedulesForDoctor = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, filterByStartAndEndDate);
  const options = pick(req.query, schedulePagination);

  const result = await ScheduleService.scheduleForDoctor(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule retrived Successfully",
    data: result,
  });
});

export const ScheduleController = {
  insertIntoDB,
  schedulesForDoctor,
};
