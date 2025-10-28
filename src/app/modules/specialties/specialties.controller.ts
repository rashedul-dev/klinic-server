import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SpecialtiesService } from "./specialties.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const createSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.createSpecialties(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties Created Successfully",
    data: result,
  });
});
const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.getAllSpecialties();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Specialties Retrived Successfully",
    data: result,
  });
});
const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtiesService.deleteSpecialties(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties Deleted Successfully",
    data: result,
  });
});

export const SpecialtiesController = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialties,
};
