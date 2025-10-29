import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader } from "../../helper/fileUploader";
import { SpecialtiesValidationSchema } from "./specialties.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", SpecialtiesController.getAllSpecialties);

router.post("/", fileUploader.upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  req.body = SpecialtiesValidationSchema.createSpecialty.parse(JSON.parse(req.body.data));
  return SpecialtiesController.createSpecialties(req, res, next);
});
router.delete("/:id", auth(UserRole.ADMIN, UserRole.DOCTOR), SpecialtiesController.deleteSpecialties);

export const SpecialtiesRoutes = router;
