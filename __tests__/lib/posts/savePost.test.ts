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

import { getSavedPosts as getSavedPostsFn } from "@/lib/posts/getSavedPosts";
import { savePost } from "@/lib/posts/savePost";
import { unsavePost as unsavePostFn } from "@/lib/posts/unsavePost";
import type { Post } from "@/types/post";
import { snap as mkSnap, querySnap } from "../helpers/firestore-mock";

const post = { id: "p1", communityId: "react", title: "T" } as Post;

beforeEach(resetFsMocks);

describe("savePost", () => {
  it("writes a savedPosts doc keyed by post id", async () => {
    const saved = await savePost("u1", post);

    expect(saved).toEqual({
      id: "p1",
      postId: "p1",
      communityId: "react",
      postTitle: "T",
      communityImageURL: "",
    });
    expect(fsMocks.setDoc).toHaveBeenCalledWith(
      { __docRef: ["users/u1/savedPosts", "p1"] },
      saved,
    );
  });

  it("uses the post's communityImageURL when present", async () => {
    const saved = await savePost("u1", {
      ...post,
      communityImageURL: "http://img",
    } as Post);
    expect(saved.communityImageURL).toBe("http://img");
  });
});

describe("unsavePost", () => {
  it("deletes the savedPosts doc for the post", async () => {
    await unsavePostFn("u1", "p1");
    expect(fsMocks.deleteDoc).toHaveBeenCalledWith({
      __docRef: ["users/u1/savedPosts", "p1"],
    });
  });
});

describe("getSavedPosts", () => {
  it("maps docs into SavedPost objects", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([mkSnap("p1", { postId: "p1", postTitle: "T" })]),
    );
    const saved = await getSavedPostsFn("u1");
    expect(saved).toEqual([{ id: "p1", postId: "p1", postTitle: "T" }]);
  });

  it("returns empty array when nothing saved", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    expect(await getSavedPostsFn("u1")).toEqual([]);
  });
});
