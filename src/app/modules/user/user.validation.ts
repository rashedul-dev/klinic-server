import z from "zod";

const createPatientValidationSchema = z.object({
  password: z.string({ error: "Password is required" }),
  patient: z.object({
    name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
    email: z.string({ error: "Email is required" }).email("Invalid email address"),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
  }),
});

const createDoctorValidationSchema = z.object({
  password: z.string({ error: "Password is required" }),
  doctor: z.object({
    name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
    email: z.string({ error: "Email is required" }).email("Invalid email address"),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string({ error: "Contact number is required" }).min(1, "Contact number cannot be empty"),
    address: z.string({ error: "Address is required" }).min(1, "Address cannot be empty"),
    registrationNumber: z
      .string({ error: "Registration number is required" })
      .min(1, "Registration number cannot be empty"),
    experience: z
      .number({ error: "Experience is required" })
      .int("Experience must be an integer")
      .nonnegative("Experience cannot be negative")
      .optional()
      .default(0),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { error: "Gender is required" }),
    appointmentFee: z
      .number({ error: "Appointment fee is required" })
      .int("Appointment fee must be an integer")
      .positive("Appointment fee must be positive"),
    qualification: z.string({ error: "Qualification is required" }).min(1, "Qualification cannot be empty"),
    currentWorkingPlace: z
      .string({ error: "Current working place is required" })
      .min(1, "Current working place cannot be empty"),
    designation: z.string({ error: "Designation is required" }).min(1, "Designation cannot be empty"),
  }),
});

const createAdminValidationSchema = z.object({
  password: z.string({ error: "Password is required" }),
  admin: z.object({
    name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
    email: z.string({ error: "Email is required" }).email("Invalid email address"),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string().optional(),
  }),
});

const updatePatientValidationSchema = z.object({
  patient: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email address").optional(),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
  }),
});

const updateDoctorValidationSchema = z.object({
  doctor: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email address").optional(),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string().min(1, "Contact number cannot be empty").optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    registrationNumber: z.string().min(1, "Registration number cannot be empty").optional(),
    experience: z.number().int("Experience must be an integer").nonnegative("Experience cannot be negative").optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    appointmentFee: z
      .number()
      .int("Appointment fee must be an integer")
      .positive("Appointment fee must be positive")
      .optional(),
    qualification: z.string().min(1, "Qualification cannot be empty").optional(),
    currentWorkingPlace: z.string().min(1, "Current working place cannot be empty").optional(),
    designation: z.string().min(1, "Designation cannot be empty").optional(),
  }),
});

const updateAdminValidationSchema = z.object({
  admin: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Invalid email address").optional(),
    profilePhoto: z.string().url("Invalid URL").optional(),
    contactNumber: z.string().optional(),
  }),
});

const changeStatusValidationSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED", "SUSPENDED"], {
    error: "Status is required & ust be one of: ACTIVE, INACTIVE, DELETED or SUSPENDED",
  }),
});

const changePasswordValidationSchema = z.object({
  oldPassword: z.string({ error: "Old password is required" }),
  newPassword: z.string({ error: "New password is required" }).min(6, "New password must be at least 6 characters"),
});

export const UserValidation = {
  createPatientValidationSchema,
  createDoctorValidationSchema,
  createAdminValidationSchema,
  updatePatientValidationSchema,
  updateDoctorValidationSchema,
  updateAdminValidationSchema,
  changeStatusValidationSchema,
  changePasswordValidationSchema,
};
