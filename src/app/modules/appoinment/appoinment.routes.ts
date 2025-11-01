import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { AppointmentController } from "./appoinment.controller";

const router = express.Router();

router.post("/", auth(UserRole.PATIENT, UserRole.ADMIN), AppointmentController.createAppointment);

export const AppointmentRoutes = router;
