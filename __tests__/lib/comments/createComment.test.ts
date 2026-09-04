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

import { createComment } from "@/lib/comments/createComment";

const user = { uid: "u1", email: "jane@x.com" } as never;

beforeEach(resetFsMocks);

describe("createComment", () => {
  it("creates a comment with derived display name and increments count", async () => {
    const comment = await createComment(
      user,
      "react",
      "p1",
      "Post title",
      "Nice!",
      0,
    );

    expect(comment).toMatchObject({
      creatorId: "u1",
      creatorDisplayText: "jane",
      communityId: "react",
      postId: "p1",
      postTitle: "Post title",
      text: "Nice!",
      depth: 0,
    });
    expect(fsMocks.batch.set).toHaveBeenCalledWith(expect.anything(), comment);
    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["posts", "p1"] },
      { numberOfComments: { __increment: 1 } },
    );
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("throws when depth exceeds 2 without writing anything", async () => {
    await expect(
      createComment(user, "react", "p1", "T", "text", 3),
    ).rejects.toThrow("Maximum comment depth reached");
    expect(fsMocks.batch.set).not.toHaveBeenCalled();
  });

  it("allows depth exactly 2", async () => {
    await expect(
      createComment(user, "react", "p1", "T", "text", 2),
    ).resolves.toMatchObject({ depth: 2 });
  });

  it("includes parentId for replies and omits it for top-level", async () => {
    const reply = await createComment(user, "react", "p1", "T", "r", 1, "c0");
    expect(reply.parentId).toBe("c0");

    const top = await createComment(user, "react", "p1", "T", "t", 0);
    expect(top).not.toHaveProperty("parentId");
  });
});
