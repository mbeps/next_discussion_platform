import { beforeEach, describe, expect, it, vi } from "vitest";
import { fsMocks, resetFsMocks, snap } from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { getPost as getClientPost } from "@/lib/posts/getPost";
import { getPost as getSsrPost } from "@/lib/post/getPost";

beforeEach(resetFsMocks);

describe("posts/getPost (client)", () => {
  it("returns post with id when found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("p1", { title: "T" }));
    expect(await getClientPost("p1")).toEqual({ id: "p1", title: "T" });
  });

  it("returns null when not found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("x", {}, { exists: false }));
    expect(await getClientPost("x")).toBeNull();
  });
});

describe("post/getPost (SSR, safe-json-stringify)", () => {
  it("returns serialized post when found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(
      snap("p1", { title: "T", createTime: null }),
    );
    const result = await getSsrPost("p1");
    expect(result).toEqual({ id: "p1", title: "T", createTime: null });
  });

  it("returns null when not found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("x", {}, { exists: false }));
    expect(await getSsrPost("x")).toBeNull();
  });

  it("returns null instead of throwing on errors", async () => {
    fsMocks.getDoc.mockRejectedValueOnce(new Error("offline"));
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await getSsrPost("p1")).toBeNull();
    vi.restoreAllMocks();
  });
});
