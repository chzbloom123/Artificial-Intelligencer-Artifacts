import { z } from "zod";

/**
 * Environment variable schema using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.string().optional(),
  // Database
  DATABASE_URL: z.string(),
  // JWT Auth
  JWT_SECRET: z.string().default("aier-super-secret-jwt-key-change-in-production-2026"),
  // Admin credentials
  ADMIN_EMAIL: z.string().default("admin@aier.press"),
  ADMIN_PASSWORD: z.string().default("aier-admin-2026"),
  // CORS
  CORS_ORIGIN: z.string().optional(),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("\u2705 Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("\u274C Environment variable validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("\u274C Unknown error during env validation:", error);
    }
    process.exit(1);
  }
}

export type Env = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

validateEnv();
