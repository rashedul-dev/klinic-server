import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { userFilterableFields, userPagination } from "./user.constant";
import pick from "../../helper/pick";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import { UserRole } from "@prisma/client";
import ApiError from "../../errors/ApiError";

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

const getMyProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const result = await UserService.getMyProfile(user as IJWTPayload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile data retrived successfully!",
    data: result,
  });
});
const updateProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile updated Successfully",
    data: result,
  });
});



// UPDATE MY PROFILE
const updateMyProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const payload = req.body;

  const result = await UserService.updateMyProfile(user!, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFormDB,
  getMyProfile,
  updateProfileStatus,
  updateMyProfile,
};
