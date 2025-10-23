import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { userFilterableFields, userPagination } from "./user.constant";
import pick from "../../helper/pick";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});
const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createDoctor(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const getAllFormDB = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, userFilterableFields);
  const options = pick(req.query, userPagination);

  const result = await UserService.getAllFormDB(filter, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrived successfully",
    meta: result.meta,
    data: result.data,
  });
});
export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFormDB,
};
