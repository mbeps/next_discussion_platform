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

import { getPosts } from "@/lib/posts/getPosts";

beforeEach(resetFsMocks);

const constraintsOf = (callIndex = 0) => {
  const q = fsMocks.getDocs.mock.calls[callIndex][0];
  return q.__query.slice(1);
};

describe("getPosts", () => {
  beforeEach(() => {
    fsMocks.getDocs.mockResolvedValue(querySnap([snap("p1", { title: "T" })]));
  });

  it("filters by communityId ordered by createTime desc with limit 10", async () => {
    await getPosts("react");
    const constraints = constraintsOf();
    expect(constraints).toEqual([
      { kind: "where", field: "communityId", op: "==", value: "react" },
      { kind: "orderBy", field: "createTime", dir: "desc" },
      { kind: "limit", n: 10 },
    ]);
  });

  it("uses an 'in' constraint for multiple subscribed communities", async () => {
    await getPosts(undefined, ["a", "b"]);
    const constraints = constraintsOf();
    expect(constraints[0]).toEqual({
      kind: "where",
      field: "communityId",
      op: "in",
      value: ["a", "b"],
    });
  });

  it("orders generic home by voteStatus desc", async () => {
    await getPosts(undefined, undefined, true);
    expect(constraintsOf()).toEqual([
      { kind: "orderBy", field: "voteStatus", dir: "desc" },
      { kind: "limit", n: 10 },
    ]);
  });

  it("appends startAfter when a cursor is given", async () => {
    const cursor = snap("p9");
    await getPosts("react", undefined, false, cursor as never);
    expect(constraintsOf()).toContainEqual({ kind: "startAfter", cursor });
  });

  it("maps docs to posts and returns the last doc as the new cursor", async () => {
    const last = snap("p2", {});
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([snap("p1", {}), last]));
    const { posts, newLastVisible } = await getPosts("react");
    expect(posts).toHaveLength(2);
    expect(newLastVisible).toBe(last);
  });

  it("returns null cursor on empty page", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    const { posts, newLastVisible } = await getPosts("react");
    expect(posts).toEqual([]);
    expect(newLastVisible).toBeNull();
  });
});
