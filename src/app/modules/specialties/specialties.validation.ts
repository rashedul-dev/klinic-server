import { z } from "zod";

const createSpecialty = z.object({
  title: z.string({
    error: "Title is required!",
  }),
});

export const SpecialtiesValidationSchema = {
  createSpecialty,
};
