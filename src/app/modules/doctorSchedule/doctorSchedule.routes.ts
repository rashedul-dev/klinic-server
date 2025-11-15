import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import validateRequest from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = express.Router();

// ADMIN ONLY ROUTES
router.get("/", auth(UserRole.ADMIN), DoctorScheduleController.getAllDoctorSchedules);

// DOCTOR ONLY ROUTES
router.get("/my-schedules",
   auth(UserRole.DOCTOR), DoctorScheduleController.getMySchedules);

// CREATE DOCTOR SCHEDULE
router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(DoctorScheduleValidation.createDoctorScheduleValidationSchema),
  DoctorScheduleController.createDoctorSchedule
);

// DELETE DOCTOR SCHEDULE
router.delete("/:id", auth(UserRole.DOCTOR), DoctorScheduleController.deleteSchedule);

export const DoctorScheduleRoutes = router;
