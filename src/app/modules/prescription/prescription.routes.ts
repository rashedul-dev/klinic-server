import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { PrescriptionController } from "./prescription.controller";

const router = express.Router();

router.post("/", auth(UserRole.DOCTOR), PrescriptionController.createPrescription);

router.get("/my-prescriptions", auth(UserRole.PATIENT), PrescriptionController.getMyPrescriptions);

router.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR), PrescriptionController.getAllPrescriptions);

router.get(
  "/:prescriptionId",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  PrescriptionController.getPrescriptionById
);

router.patch("/:prescriptionId", auth(UserRole.DOCTOR), PrescriptionController.updatePrescription);

router.delete("/:prescriptionId", auth(UserRole.ADMIN, UserRole.DOCTOR), PrescriptionController.deletePrescription);

export const PrescriptionRoutes = router;
