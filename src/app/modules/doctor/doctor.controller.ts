import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helper/pick";
import { doctorFilterableFields, doctorPagination } from "./doctor.constant";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";

const getAllDoctor = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, doctorPagination);
  const fillters = pick(req.query, doctorFilterableFields);

  const result = await DoctorService.getAllDoctor(fillters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors retrived successfully!",
    meta: result.meta,
    data: result.data,
  });
});
const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DoctorService.getAllDoctor(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully!",
    data: result,
  });
});
const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.getDoctorById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrive successfully!",
    data: result,
  });
});
const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.deleteDoctor(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully!",
    data: result,
  });
});
const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.softDeleteDoctor(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor soft deleted successfully!",
    data: result,
  });
});
const getDoctorSuggetion = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getDoctorSuggestion(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI Suggested Doctor Fetched successsfully",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctor,
  updateDoctor,
  getDoctorById,
  deleteDoctor,
  softDeleteDoctor,
  getDoctorSuggetion,
};
