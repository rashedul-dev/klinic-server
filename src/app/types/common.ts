import { UserRole } from "@prisma/client";

export type JWTPaylaod = {
  email: string;
  role: UserRole;
};
