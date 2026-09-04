/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { createCommunitySchema } from "@/schema/community";

const valid = { name: "validname1", type: "public" } as const;

describe("createCommunitySchema", () => {
  it.each(["public", "restricted", "private"])(
    "accepts name with type %s",
    (type) => {
      expect(createCommunitySchema.safeParse({ ...valid, type }).success).toBe(
        true,
      );
    },
  );

  it("rejects names shorter than 3 characters", () => {
    const result = createCommunitySchema.safeParse({ ...valid, name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 3");
    }
  });

  it("accepts a name of exactly 3 characters", () => {
    expect(
      createCommunitySchema.safeParse({ ...valid, name: "abc" }).success,
    ).toBe(true);
  });

  it("accepts a name of exactly 21 characters", () => {
    expect(
      createCommunitySchema.safeParse({ ...valid, name: "a".repeat(21) })
        .success,
    ).toBe(true);
  });

  it("rejects names longer than 21 characters", () => {
    expect(
      createCommunitySchema.safeParse({ ...valid, name: "a".repeat(22) })
        .success,
    ).toBe(false);
  });

  it("rejects non-alphanumeric names", () => {
    for (const bad of ["has space", "dash-name", "under_score", "excl!"]) {
      expect(
        createCommunitySchema.safeParse({ ...valid, name: bad }).success,
      ).toBe(false);
    }
  });

  it("rejects an invalid community type", () => {
    expect(
      createCommunitySchema.safeParse({ ...valid, type: "secret" }).success,
    ).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(createCommunitySchema.safeParse({}).success).toBe(false);
  });
});
