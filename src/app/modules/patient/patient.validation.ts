import { z } from "zod";

const patientFilterValidationSchema = z.object({
  searchTerm: z.string().optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

const patientOptionsValidationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const patientUpdateValidationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  profilePhoto: z.string().url("Invalid URL format").optional().or(z.literal("")),
  contactNumber: z.string().min(1, "Contact number is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
});

export const PatientValidation = {
  patientFilterValidationSchema,
  patientOptionsValidationSchema,
  patientUpdateValidationSchema,
};
