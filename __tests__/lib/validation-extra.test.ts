/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { validateSignupForm } from "@/lib/validation";

describe("validateSignupForm — extra edge cases", () => {
  it("accepts a strong password meeting every rule", () => {
    expect(
      validateSignupForm({ password: "Abcdef1!", confirmPassword: "Abcdef1!" }),
    ).toBeNull();
  });

  it("rejects mismatched passwords before other checks", () => {
    expect(
      validateSignupForm({ password: "short", confirmPassword: "different" }),
    ).toBe("Passwords don't match");
  });

  it("rejects a password of exactly 7 characters even when valid otherwise", () => {
    expect(
      validateSignupForm({ password: "Abcde1!", confirmPassword: "Abcde1!" }),
    ).toBe("Password must be at least 8 characters long");
  });

  it("rejects a password without digits", () => {
    expect(
      validateSignupForm({ password: "Abcdefg!", confirmPassword: "Abcdefg!" }),
    ).toBe("Password must contain at least 1 number");
  });

  it("rejects a password without special characters", () => {
    expect(
      validateSignupForm({ password: "Abcdefg1", confirmPassword: "Abcdefg1" }),
    ).toBe("Password must contain at least 1 special character");
  });

  it("rejects a password without capital letters", () => {
    expect(
      validateSignupForm({ password: "abcdef1!", confirmPassword: "abcdef1!" }),
    ).toBe("Password must contain at least 1 capital letter");
  });

  it("rejects bracket-style characters not in the allowed special set", () => {
    // ponytail: regex only allows !@#$%^&*(),.?":{}|<> — brackets are excluded; assert actual behaviour
    expect(
      validateSignupForm({
        password: "Abcdefg1[]",
        confirmPassword: "Abcdefg1[]",
      }),
    ).toBe("Password must contain at least 1 special character");
  });

  it("accepts curly-brace special characters", () => {
    expect(
      validateSignupForm({
        password: "Abcdefg1{}",
        confirmPassword: "Abcdefg1{}",
      }),
    ).toBeNull();
  });

  it("checks rules in order: length before number before special before capital", () => {
    // fails length AND number AND special AND capital → reports length first
    expect(
      validateSignupForm({ password: "abc", confirmPassword: "abc" }),
    ).toBe("Password must be at least 8 characters long");
    // passes length but fails number/special/capital → reports number
    expect(
      validateSignupForm({ password: "abcdefgh", confirmPassword: "abcdefgh" }),
    ).toBe("Password must contain at least 1 number");
  });

  it("handles very long passwords", () => {
    const pw = `A1!${"x".repeat(200)}`;
    expect(
      validateSignupForm({ password: pw, confirmPassword: pw }),
    ).toBeNull();
  });
});
