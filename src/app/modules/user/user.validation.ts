import z from "zod";

const createPatientValidationSchema = z.object({
  password: z.string(),
  patient: {
    name: z.string({
      error: "Name is required",
    }),
    email: z.string({
      error: "email is required",
    }),
    address: z.string().optional(),
  },
});

export const UserValidation = {
  createPatientValidationSchema,
};
