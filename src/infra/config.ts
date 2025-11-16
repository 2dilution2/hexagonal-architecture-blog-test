import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(1).default("secret"),
  PORT: z.coerce.number().default(3000),
  DB: z.enum(["memory", "postgres"]).default("postgres"),
  ENABLE_SWAGGER_UI: z
    .string()
    .default("true")
    .transform((val) => val === "true" || val === "1"),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ 환경 변수 검증 실패:");
    result.error.issues.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }

  return result.data;
}
