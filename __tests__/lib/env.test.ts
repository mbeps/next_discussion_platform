/// <reference types="vitest" />
import { env, validateEnv } from "@/lib/env";
import { describe, expect, it, vi } from "vitest";

const mockValidEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "mock-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mock-domain",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "mock-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mock-bucket",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "mock-sender",
  NEXT_PUBLIC_FIREBASE_APP_ID: "mock-app",
  NODE_ENV: "test",
};

describe("lib/env", () => {
  describe("validateEnv", () => {
    it("validates client environment correctly when isServerEnv is false", () => {
      const validated = validateEnv(mockValidEnv, false);
      expect(validated.NEXT_PUBLIC_FIREBASE_API_KEY).toBe("mock-key");
      expect(validated.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN).toBe("mock-domain");
    });

    it("validates server environment correctly when isServerEnv is true", () => {
      const validated = validateEnv(mockValidEnv, true);
      expect(validated.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe("mock-project");
      expect(validated.NODE_ENV).toBe("test");
    });

    it("throws error and logs to console when required variable is missing", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidEnv = { ...mockValidEnv, NEXT_PUBLIC_FIREBASE_API_KEY: "" };

      expect(() => validateEnv(invalidEnv, false)).toThrow(
        "Invalid environment variables",
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("validates with default arguments using process.env", () => {
      const result = validateEnv();
      expect(result).toBeDefined();
      expect(result.NEXT_PUBLIC_FIREBASE_API_KEY).toBeDefined();
    });
  });

  describe("env singleton", () => {
    it("exports initialized and typed env singleton", () => {
      expect(env).toBeDefined();
      expect(typeof env.NEXT_PUBLIC_FIREBASE_API_KEY).toBe("string");
      expect(typeof env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN).toBe("string");
      expect(typeof env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe("string");
      expect(typeof env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).toBe("string");
      expect(typeof env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID).toBe("string");
      expect(typeof env.NEXT_PUBLIC_FIREBASE_APP_ID).toBe("string");
    });
  });
});

