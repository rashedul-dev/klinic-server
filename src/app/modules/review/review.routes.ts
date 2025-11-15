import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", ReviewController.getAllReviews);

router.get("/doctor/:doctorId", ReviewController.getReviewsByDoctorId);

router.post("/", auth(UserRole.PATIENT, UserRole.ADMIN), ReviewController.createReview);

export const ReviewRoutes = router;
