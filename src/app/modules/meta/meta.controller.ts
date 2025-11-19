import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";

const getDashboardMetaData = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const result = await MetaService.getDashboardMetaData(user as IJWTPayload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meta data retrival successfully!",
    data: result,
  });
});

export const MetaController = {
  getDashboardMetaData,
};
