/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { addAdminSchema } from "@/schema/admin";

describe("addAdminSchema", () => {
  it("accepts a valid email", () => {
    expect(
      addAdminSchema.safeParse({ email: "admin@rhul.ac.uk" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = addAdminSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects emails shorter than 3 characters", () => {
    expect(addAdminSchema.safeParse({ email: "a@" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(addAdminSchema.safeParse({}).success).toBe(false);
  });
});
