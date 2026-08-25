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

import { handlePostVote } from "@/lib/posts/handlePostVote";
import { Post, PostVote } from "@/types/post";

const post = (voteStatus = 5): Post =>
  ({ id: "p1", voteStatus, communityId: "react" }) as Post;

const existingVote = (voteValue: number): PostVote =>
  ({ id: "v1", postId: "p1", communityId: "react", voteValue }) as PostVote;

beforeEach(resetFsMocks);

describe("handlePostVote", () => {
  it("creates a new vote with delta = vote", async () => {
    const result = await handlePostVote("u1", post(), 1, "react");

    expect(result.voteChange).toBe(1);
    expect(result.newVote).toMatchObject({
      postId: "p1",
      communityId: "react",
      voteValue: 1,
    });
    expect(fsMocks.batch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ voteValue: 1 }),
    );
    expect(fsMocks.batch.delete).not.toHaveBeenCalled();
  });

  it("toggle-off deletes the vote with delta = -vote", async () => {
    const result = await handlePostVote(
      "u1",
      post(),
      1,
      "react",
      existingVote(1),
    );

    expect(result.voteChange).toBe(-1);
    expect(result.voteIdToDelete).toBe("v1");
    expect(result.newVote).toBeUndefined();
    expect(fsMocks.batch.delete).toHaveBeenCalledWith({
      __docRef: ["users", "u1/postVotes/v1"],
    });
    expect(fsMocks.batch.set).not.toHaveBeenCalled();
  });

  it("switch updates the vote with delta = 2 * vote", async () => {
    const result = await handlePostVote(
      "u1",
      post(),
      -1,
      "react",
      existingVote(1),
    );

    expect(result.voteChange).toBe(-2);
    expect(result.newVote).toMatchObject({ id: "v1", voteValue: -1 });
    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["users", "u1/postVotes/v1"] },
      { voteValue: -1 },
    );
  });

  it("updates post.voteStatus to current + delta and commits once", async () => {
    const result = await handlePostVote("u1", post(5), 1, "react");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["posts", "p1"] },
      { voteStatus: 6 },
    );
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
    expect(result.voteChange).toBe(1);
  });

  it("downvote switch from -1 to 1 gives delta +2", async () => {
    const result = await handlePostVote(
      "u1",
      post(),
      1,
      "react",
      existingVote(-1),
    );
    expect(result.voteChange).toBe(2);
  });
});
