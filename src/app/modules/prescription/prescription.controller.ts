import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionService } from "./prescription.service";
import httpStatus from "http-status";
import { IOptionResult } from "../../helper/paginationHelper";
import pick from "../../helper/pick";
import { prescriptionFilterableFields } from "./prescription.constants";

const createPrescription = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.createPrescription(user as IJWTPayload, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Prescription created successfully!",
    data: result,
  });
});

// GET MY PRESCRIPTIONS AS PATIENT
const getMyPrescriptions = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.getMyPrescriptions(user as IJWTPayload, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My prescriptions retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

// GET ALL PRESCRIPTIONS (ADMIN/DOCTOR)
const getAllPrescriptions = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const filters = pick(req.query, prescriptionFilterableFields);
  const result = await PrescriptionService.getAllPrescriptions(user as IJWTPayload, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescriptions retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

// GET SINGLE PRESCRIPTION BY ID
const getPrescriptionById = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.getPrescriptionById(user as IJWTPayload, prescriptionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription retrieved successfully!",
    data: result,
  });
});

// UPDATE PRESCRIPTION
const updatePrescription = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.updatePrescription(user as IJWTPayload, prescriptionId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription updated successfully!",
    data: result,
  });
});

// DELETE PRESCRIPTION
const deletePrescription = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.deletePrescription(user as IJWTPayload, prescriptionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription deleted successfully!",
    data: result,
  });
});

export const PrescriptionController = {
  createPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
