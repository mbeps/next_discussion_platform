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

import { getComments } from "@/lib/comments/getComments";

beforeEach(resetFsMocks);

describe("getComments", () => {
  it("queries comments by postId ordered createdAt desc", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await getComments("p1");

    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query[0]).toEqual({ __collection: ["comments"] });
    expect(q.__query.slice(1)).toEqual([
      { kind: "where", field: "postId", op: "==", value: "p1" },
      { kind: "orderBy", field: "createdAt", dir: "desc" },
    ]);
  });

  it("maps docs into Comment objects with ids", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("c1", { text: "a" }), snap("c2", { text: "b" })]),
    );
    const comments = await getComments("p1");
    expect(comments).toEqual([
      { id: "c1", text: "a" },
      { id: "c2", text: "b" },
    ]);
  });

  it("returns empty array when post has no comments", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    expect(await getComments("p1")).toEqual([]);
  });
});
