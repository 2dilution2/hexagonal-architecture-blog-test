import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;
