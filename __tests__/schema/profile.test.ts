/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { editProfileSchema } from "@/schema/profile";

describe("editProfileSchema", () => {
  it("accepts a valid display name", () => {
    expect(editProfileSchema.safeParse({ displayName: "Maruf" }).success).toBe(
      true,
    );
  });

  it("rejects an empty display name", () => {
    const result = editProfileSchema.safeParse({ displayName: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Display name is required");
    }
  });

  it("accepts a display name of exactly 50 characters", () => {
    expect(
      editProfileSchema.safeParse({ displayName: "x".repeat(50) }).success,
    ).toBe(true);
  });

  it("rejects a display name longer than 50 characters", () => {
    expect(
      editProfileSchema.safeParse({ displayName: "x".repeat(51) }).success,
    ).toBe(false);
  });

  it("rejects missing displayName", () => {
    expect(editProfileSchema.safeParse({}).success).toBe(false);
  });
});
