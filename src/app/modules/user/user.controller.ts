import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req);
  // console.log(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient create successful",
    data: result,
  });
});

const getAllFormDB = catchAsync(async (req: Request, res: Response) => {
  // const result = await UserService.getAllFormDB(filter, options);
});
export const UserController = {
  createPatient,
  getAllFormDB,
};
