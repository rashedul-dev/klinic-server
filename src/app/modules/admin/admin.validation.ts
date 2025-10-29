import { z } from 'zod';

const createAdminZodSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required'),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

const updateAdminZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
  updateAdminZodSchema,
};