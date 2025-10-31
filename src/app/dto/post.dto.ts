import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const CreatePostDto = z.object({
  authorId: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  published: z.boolean().optional(),
});
export type CreatePostDto = z.infer<typeof CreatePostDto>;

export const UpdatePostDto = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  title: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});
export type UpdatePostDto = z.infer<typeof UpdatePostDto>;
