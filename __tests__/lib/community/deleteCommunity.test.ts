import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_s: unknown, path: string) => ({ __storageRef: path })),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

import { deleteCommunity } from "@/lib/community/deleteCommunity";
import { deleteObject, ref } from "firebase/storage";

beforeEach(resetFsMocks);
afterEach(() => vi.clearAllMocks());

describe("deleteCommunity", () => {
  const community = { id: "react", imageURL: "http://img" } as never;

  it("deletes community doc, posts, comments, snippets in chunked batches", async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(
        querySnap([snap("p1", { communityId: "react" }), snap("p2", {})]),
      ) // posts
      .mockResolvedValueOnce(querySnap([snap("c1", {})])) // comments for p1
      .mockResolvedValueOnce(querySnap([])) // comments for p2
      .mockResolvedValueOnce(querySnap([snap("s1", {})]))
      .mockResolvedValueOnce(querySnap([snap("s1", {})])); // snippets

    await deleteCommunity(community);

    // community + 2 posts + 1 comment + 1 snippet = 5 deletes
    expect(fsMocks.batch.delete).toHaveBeenCalledTimes(5);
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("deletes post images only for posts that have one", async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(
        querySnap([
          snap("p1", { communityId: "react", id: "p1", imageURL: "http://a" }),
          snap("p2", { id: "p2" }),
        ]),
      )
      .mockResolvedValue(querySnap([]));

    await deleteCommunity({ id: "react" } as never);

    // only p1 has an imageURL; community has none
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(expect.anything(), "posts/p1/image");
  });

  it("deletes the community image when present and swallows its failure", async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]));
    vi.mocked(deleteObject)
      .mockRejectedValueOnce(new Error("boom")) // community image
      .mockResolvedValue();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(
      deleteCommunity({ id: "react", imageURL: "http://img" } as never),
    ).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalledWith(
      "Error deleting community image",
      expect.any(Error),
    );
    logSpy.mockRestore();
  });

  it("chunks batches at 450 docs", async () => {
    const manyPosts = Array.from({ length: 500 }, (_, i) => snap(`p${i}`, {}));
    fsMocks.getDocs
      .mockResolvedValueOnce(querySnap(manyPosts))
      .mockResolvedValue(querySnap([]));

    await deleteCommunity({ id: "react" } as never);

    // 500 posts + community doc = 501 docs → 2 chunks (450 + 51)
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(2);
  });
});
