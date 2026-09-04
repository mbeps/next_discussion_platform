/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema, signUpSchema } from "@/schema/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password is required");
    }
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts matching passwords of at least 6 characters", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "abcdef",
      confirmPassword: "abcdef",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "abcde",
      confirmPassword: "abcde",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords with error on confirmPassword path", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "abcdef",
      confirmPassword: "ghijkl",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Passwords do not match",
      );
      expect(issue?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "bad",
      password: "abcdef",
      confirmPassword: "abcdef",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty confirmPassword", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "abcdef",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(resetPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(
      true,
    );
  });

  it("rejects an invalid email", () => {
    expect(resetPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a missing email", () => {
    expect(resetPasswordSchema.safeParse({}).success).toBe(false);
  });
});
