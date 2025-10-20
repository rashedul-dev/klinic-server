import { config } from "dotenv";
import { createPatientInput } from "./user.interface";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    console.log(uploadResult);
  }

  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.email,
        password: hashPassword,
      },
    });

    return await tnx.patient.create({
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  });
  return result;
};

export const UserService = {
  createPatient,
};
