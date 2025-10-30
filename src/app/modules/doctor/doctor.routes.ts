import express from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", DoctorController.getAllDoctor);

router.get("/:id", DoctorController.getDoctorById);

router.post("/suggestion", DoctorController.getDoctorSuggetion);

router.patch("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), DoctorController.updateDoctor);

router.delete("/:id", auth(UserRole.ADMIN), DoctorController.deleteDoctor);

router.delete("/soft/:id", auth(UserRole.DOCTOR, UserRole.ADMIN), DoctorController.softDeleteDoctor);

export const DoctorRoutes = router;
