import {
  type ClientEnv,
  clientEnvSchema,
  type Env,
  type ServerEnv,
  serverEnvSchema,
} from "@/schema/env";

export type { ClientEnv, Env, ServerEnv };
export { clientEnvSchema, serverEnvSchema };

/**
 * Validates environment variables according to active runtime context.
 * Uses explicit process.env keys so Next.js bundlers can statically inline NEXT_PUBLIC_* variables.
 *
 * @param runtimeEnv - Key-value environment dictionary (defaults to explicitly mapped process.env)
 * @param isServerEnv - Whether execution is running on server (defaults to window check)
 * @returns Validated environment object
 */
export function validateEnv(
  runtimeEnv: Record<string, unknown> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NODE_ENV: process.env.NODE_ENV,
    BROWSERSLIST_IGNORE_OLD_DATA: process.env.BROWSERSLIST_IGNORE_OLD_DATA,
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA:
      process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA,
  },
  isServerEnv: boolean = typeof window === "undefined",
): Env {
  const schema = isServerEnv ? serverEnvSchema : clientEnvSchema;
  const parsed = schema.safeParse(runtimeEnv);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }

  return parsed.data as Env;
}

export const env: Env = validateEnv();
