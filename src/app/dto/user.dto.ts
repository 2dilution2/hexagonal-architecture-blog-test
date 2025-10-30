import { z } from "zod";

export const CreateUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;
