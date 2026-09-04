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

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_s: unknown, path: string) => ({ __storageRef: path })),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

import { deletePost } from "@/lib/posts/deletePost";
import { deleteObject } from "firebase/storage";
import { Post } from "@/types/post";

const post = (imageURL?: string) => ({ id: "p1", imageURL }) as Post;

beforeEach(resetFsMocks);

describe("deletePost", () => {
  it("deletes the post doc and its comments in a batch", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("c1", {}), snap("c2", {})]),
    );

    await deletePost(post());

    expect(fsMocks.deleteDoc).toHaveBeenCalledWith({
      __docRef: ["posts", "p1"],
    });
    expect(fsMocks.batch.delete).toHaveBeenCalledTimes(2);
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("deletes the storage image only when imageURL present", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await deletePost(post("http://img"));
    expect(deleteObject).toHaveBeenCalledTimes(1);
  });

  it("skips storage when no imageURL", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await deletePost(post());
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("handles a post with zero comments", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await expect(deletePost(post())).resolves.toBeUndefined();
    expect(fsMocks.batch.delete).not.toHaveBeenCalled();
  });
});
