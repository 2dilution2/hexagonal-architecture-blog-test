import { z } from "zod";

export const SignUpDto = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(1).max(30),
})
export type SignUpDto = z.infer<typeof SignUpDto>;

export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})
export type LoginDto = z.infer<typeof LoginDto>;

export const RefreshDto = z.object({
    refreshToken: z.string().min(10),
})
export type RefreshDto = z.infer<typeof RefreshDto>;