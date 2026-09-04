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

import { getPostVotes } from "@/lib/posts/getPostVotes";

beforeEach(resetFsMocks);

describe("getPostVotes", () => {
  it("chunks postIds into groups of 10", async () => {
    const ids = Array.from({ length: 25 }, (_, i) => `p${i}`);
    fsMocks.getDocs.mockResolvedValue(querySnap([]));

    await getPostVotes("u1", ids);

    expect(fsMocks.getDocs).toHaveBeenCalledTimes(3);
    const chunkSizes = fsMocks.getDocs.mock.calls.map((call) => {
      const q = call[0];
      const whereC = q.__query.slice(1)[0];
      return (whereC as { value: string[] }).value.length;
    });
    expect(chunkSizes).toEqual([10, 10, 5]);
  });

  it("maps docs into PostVote objects with ids", async () => {
    fsMocks.getDocs.mockResolvedValue(
      querySnap([snap("v1", { postId: "p1", voteValue: 1 })]),
    );
    const votes = await getPostVotes("u1", ["p1"]);
    expect(votes).toEqual([{ id: "v1", postId: "p1", voteValue: 1 }]);
  });

  it("merges results across chunks", async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(querySnap([snap("v1", {})]))
      .mockResolvedValueOnce(querySnap([snap("v2", {})]));

    // ponytail: need >10 ids so the source chunks into two queries
    const ids = Array.from({ length: 11 }, (_, i) => `p${i}`);
    fsMocks.getDocs
      .mockResolvedValueOnce(querySnap([snap("v1", {})]))
      .mockResolvedValueOnce(querySnap([snap("v2", {})]));

    const votes = await getPostVotes("u1", ids);
    expect(votes.map((v) => v.id)).toEqual(["v1", "v2"]);
  });

  it("returns empty array for empty input without querying", async () => {
    const votes = await getPostVotes("u1", []);
    expect(votes).toEqual([]);
    expect(fsMocks.getDocs).not.toHaveBeenCalled();
  });
});
