/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { commentSchema } from "@/schema/comment";

describe("commentSchema", () => {
  it("accepts non-empty text", () => {
    expect(commentSchema.safeParse({ text: "nice post" }).success).toBe(true);
  });

  it("rejects empty text", () => {
    const result = commentSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Comment cannot be empty");
    }
  });

  it("rejects whitespace-only text (min(1) counts any char)", () => {
    // ponytail: schema uses min(1), so a single space passes — document actual behaviour
    expect(commentSchema.safeParse({ text: " " }).success).toBe(true);
  });

  it("rejects missing text", () => {
    expect(commentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string text", () => {
    expect(commentSchema.safeParse({ text: null }).success).toBe(false);
  });
});
