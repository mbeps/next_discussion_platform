import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fsMocks,
  querySnap,
  resetFsMocks,
  snap,
} from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { updateUserPostsName } from "@/lib/user-profile/updateUserPostsName";
import { updateUserCommentsName } from "@/lib/user-profile/updateUserCommentsName";

beforeEach(resetFsMocks);

describe("updateUserPostsName", () => {
  it("batch-updates creatorUsername on all the user's posts", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("p1", {}), snap("p2", {})]),
    );

    await updateUserPostsName("u1", "New Name");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["posts", "p1"] },
      { creatorUsername: "New Name" },
    );
    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["posts", "p2"] },
      { creatorUsername: "New Name" },
    );
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("queries posts by creatorId equality", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await updateUserPostsName("u1", "X");
    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query.slice(1)).toContainEqual({
      kind: "where",
      field: "creatorId",
      op: "==",
      value: "u1",
    });
  });

  it("commits an empty batch when the user has no posts", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await updateUserPostsName("u1", "X");
    expect(fsMocks.batch.update).not.toHaveBeenCalled();
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });
});

describe("updateUserCommentsName", () => {
  it("batch-updates creatorDisplayText on all the user's comments", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([snap("c1", {})]));

    await updateUserCommentsName("u1", "New Name");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["comments", "c1"] },
      { creatorDisplayText: "New Name" },
    );
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("queries comments by creatorId equality", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await updateUserCommentsName("u1", "X");
    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query.slice(1)).toContainEqual({
      kind: "where",
      field: "creatorId",
      op: "==",
      value: "u1",
    });
  });
});
