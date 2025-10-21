import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.services";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  // console.log(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User loggedin successfully",
    data: result,
  });
});
export const AuthController = {
  login,
};
