import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPaylaod } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionService } from "./prescription.service";
import httpStatus from "http-status";

const createPrescription = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.createPrescription(user as IJWTPaylaod, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Prescription created successfully!",
    data: result,
  });
});

// GET MY PRESCRIPTIONS AS PATIENT
const getMyPrescriptions = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.getMyPrescriptions(user as IJWTPaylaod);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My prescriptions retrieved successfully!",
    data: result,
  });
});

// GET ALL PRESCRIPTIONS (ADMIN/DOCTOR)
const getAllPrescriptions = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.getAllPrescriptions(user as IJWTPaylaod);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescriptions retrieved successfully!",
    data: result,
  });
});

// GET SINGLE PRESCRIPTION BY ID
const getPrescriptionById = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.getPrescriptionById(user as IJWTPaylaod, prescriptionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription retrieved successfully!",
    data: result,
  });
});

// UPDATE PRESCRIPTION
const updatePrescription = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.updatePrescription(user as IJWTPaylaod, prescriptionId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription updated successfully!",
    data: result,
  });
});

// DELETE PRESCRIPTION
const deletePrescription = catchAsync(async (req: Request & { user?: IJWTPaylaod }, res: Response) => {
  const user = req.user;
  const { prescriptionId } = req.params;
  const result = await PrescriptionService.deletePrescription(user as IJWTPaylaod, prescriptionId);

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