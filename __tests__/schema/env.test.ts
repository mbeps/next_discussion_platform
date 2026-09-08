/// <reference types="vitest" />
import { clientEnvSchema, serverEnvSchema } from "@/schema/env";
import { describe, expect, it } from "vitest";

const validClientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef",
};

describe("clientEnvSchema", () => {
  it("validates successfully with complete client config", () => {
    const result = clientEnvSchema.safeParse(validClientEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validClientEnv);
    }
  });

  it("rejects when required variables are missing", () => {
    const keys: (keyof typeof validClientEnv)[] = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ];

    for (const key of keys) {
      const incomplete = { ...validClientEnv };
      delete incomplete[key];
      const result = clientEnvSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    }
  });

  it("rejects empty string values for required variables", () => {
    const result = clientEnvSchema.safeParse({
      ...validClientEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("serverEnvSchema", () => {
  it("validates successfully with default NODE_ENV", () => {
    const result = serverEnvSchema.safeParse(validClientEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
    }
  });

  it("accepts valid NODE_ENV values", () => {
    const validEnvs = ["development", "test", "production"] as const;
    for (const nodeEnv of validEnvs) {
      const result = serverEnvSchema.safeParse({
        ...validClientEnv,
        NODE_ENV: nodeEnv,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe(nodeEnv);
      }
    }
  });

  it("rejects invalid NODE_ENV value", () => {
    const result = serverEnvSchema.safeParse({
      ...validClientEnv,
      NODE_ENV: "staging",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional browser data suppression flags", () => {
    const result = serverEnvSchema.safeParse({
      ...validClientEnv,
      BROWSERSLIST_IGNORE_OLD_DATA: "true",
      BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.BROWSERSLIST_IGNORE_OLD_DATA).toBe("true");
      expect(result.data.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA).toBe("true");
    }
  });

  it("rejects when required client variables are missing in server context", () => {
    const result = serverEnvSchema.safeParse({
      NODE_ENV: "production",
    });
    expect(result.success).toBe(false);
  });
});

