import express from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR), ScheduleController.schedulesForDoctor);
router.post("/", ScheduleController.insertIntoDB);
router.delete("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), ScheduleController.deleteSchedule);

export const ScheduleRoutes = router;
