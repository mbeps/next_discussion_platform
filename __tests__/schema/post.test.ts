/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { createPostSchema } from "@/schema/post";

describe("createPostSchema", () => {
  it("accepts title only", () => {
    expect(createPostSchema.safeParse({ title: "Hello" }).success).toBe(true);
  });

  it("accepts title and body", () => {
    expect(
      createPostSchema.safeParse({ title: "Hello", body: "World" }).success,
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createPostSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required");
    }
  });

  it("accepts a title of exactly 300 characters", () => {
    expect(createPostSchema.safeParse({ title: "a".repeat(300) }).success).toBe(
      true,
    );
  });

  it("rejects a title longer than 300 characters", () => {
    expect(createPostSchema.safeParse({ title: "a".repeat(301) }).success).toBe(
      false,
    );
  });

  it("allows body to be an empty string when present", () => {
    expect(createPostSchema.safeParse({ title: "T", body: "" }).success).toBe(
      true,
    );
  });

  it("rejects a non-string title", () => {
    expect(createPostSchema.safeParse({ title: 42 }).success).toBe(false);
  });
});
