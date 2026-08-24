import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
    content: z.unknown().optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Nothing to update",
  });

export const shareSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  permission: z.enum(["VIEW", "EDIT"]).default("EDIT"),
});
