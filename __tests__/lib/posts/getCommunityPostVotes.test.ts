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

import { getCommunityPostVotes } from "@/lib/posts/getCommunityPostVotes";

beforeEach(resetFsMocks);

describe("getCommunityPostVotes", () => {
  it("queries the user's postVotes filtered by communityId", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await getCommunityPostVotes("u1", "react");

    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query[0]).toEqual({ __collection: ["users", "u1/postVotes"] });
    expect(q.__query.slice(1)).toContainEqual({
      kind: "where",
      field: "communityId",
      op: "==",
      value: "react",
    });
  });

  it("maps docs into PostVote objects", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("v1", { communityId: "react", voteValue: -1 })]),
    );
    const votes = await getCommunityPostVotes("u1", "react");
    expect(votes).toEqual([{ id: "v1", communityId: "react", voteValue: -1 }]);
  });

  it("returns empty array when user has no votes there", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    expect(await getCommunityPostVotes("u1", "react")).toEqual([]);
  });
});
