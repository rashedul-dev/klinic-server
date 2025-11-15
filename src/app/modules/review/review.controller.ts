import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import pick from "../../helper/pick";
import { reviewFilterableFields } from "./review.contant";

const createReview = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
  const user = req.user;
  const result = await ReviewService.createReview(user as IJWTPayload, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review Created Successfully",
    data: result,
  });
});

// GET ALL REVIEWS (PUBLIC)
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ReviewService.getAllReviews(options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// GET REVIEWS BY DOCTOR ID (PUBLIC)
const getReviewsByDoctorId = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const filters = pick(req.query, ["rating", "startDate", "endDate"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ReviewService.getReviewsByDoctorId(doctorId, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewsByDoctorId,
};
