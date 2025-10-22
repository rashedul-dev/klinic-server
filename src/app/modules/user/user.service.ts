import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { fileUploader } from "../../helper/fileUploader";
import bcrypt from "bcryptjs";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
    console.log({ uploadResult });
  }

  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
  return result;
};

const getAllFormDB = async (req: Request) => {
  // const { page, limit, skip, sortBy, sortOrder }=
};

export const UserService = {
  createPatient,
  getAllFormDB,
};
