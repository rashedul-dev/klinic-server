import { UserRole } from "@prisma/client";

export type IJWTPaylaod = {
  email: string;
  role: UserRole;
};
