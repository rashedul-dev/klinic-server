import { Request, Response } from "express";
import { PatientService } from "./patient.service";
import httpStatus from "http-status";
import { patientFilterableFields, patientPagination } from "./patient.constant";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, patientPagination);

  const result = await PatientService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieved successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.updateIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const PatientController = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
