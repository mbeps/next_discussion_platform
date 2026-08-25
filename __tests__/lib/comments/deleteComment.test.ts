import { beforeEach, describe, expect, it, vi } from "vitest";
import { fsMocks, resetFsMocks } from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { deleteComment } from "@/lib/comments/deleteComment";

beforeEach(resetFsMocks);

describe("deleteComment", () => {
  it("deletes the comment and all descendants in one batch", async () => {
    const deleted = await deleteComment("c1", "p1", ["c2", "c3"]);

    expect(deleted).toBe(3);
    expect(fsMocks.batch.delete).toHaveBeenCalledTimes(3);
    expect(fsMocks.batch.delete).toHaveBeenCalledWith({
      __docRef: ["comments", "c1"],
    });
    expect(fsMocks.batch.delete).toHaveBeenCalledWith({
      __docRef: ["comments", "c2"],
    });
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("decrements numberOfComments by total deleted count", async () => {
    await deleteComment("c1", "p1", ["c2", "c3"]);
    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["posts", "p1"] },
      { numberOfComments: { __increment: -3 } },
    );
  });

  it("handles a leaf comment with no descendants", async () => {
    const deleted = await deleteComment("c1", "p1", []);
    expect(deleted).toBe(1);
    expect(fsMocks.batch.update).toHaveBeenCalledWith(expect.anything(), {
      numberOfComments: { __increment: -1 },
    });
  });
});
