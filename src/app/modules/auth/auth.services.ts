import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { email } from "zod";
import { jwtHelper } from "../../helper/jwtHelper";
import { Z_NEED_DICT } from "zlib";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
  if (!isCorrectPassword) {
    throw new Error("Invalid creadential");
  }
  const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, "abcd", "1h");
  const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role }, "abcd", "7d");
  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  login,
};
