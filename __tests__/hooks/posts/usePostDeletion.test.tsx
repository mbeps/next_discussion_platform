/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, createStore, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deletePost: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/posts/deletePost", () => ({
  deletePost: mocks.deletePost,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { postStateAtom } from "@/atoms/postsAtom";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import usePostDeletion from "@/hooks/posts/usePostDeletion";
import { Post, SavedPostFixture } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

function useHarness() {
  const setPostStateValue = useSetAtom(postStateAtom);
  return usePostDeletion(setPostStateValue);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = createStore();
});

describe("usePostDeletion", () => {
  it("removes the post optimistically and returns true on success", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post({ id: "p1" }), Post({ id: "p2" })],
      postVotes: [],
    });
    mocks.deletePost.mockResolvedValue(undefined);
    const { result } = renderHook(() => useHarness(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onDeletePost(Post({ id: "p1" }));
    });
    expect(ok).toBe(true);
    expect(store.get(postStateAtom).posts.map((p) => p.id)).toEqual(["p2"]);
  });

  it("cleans up the matching savedPosts entry", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [],
    });
    store.set(savedPostStateAtom, (prev) => ({
      ...prev,
      savedPosts: [
        SavedPostFixture({ postId: "p1" }),
        SavedPostFixture({ postId: "p9" }),
      ],
    }));
    mocks.deletePost.mockResolvedValue(undefined);
    const { result } = renderHook(() => useHarness(), { wrapper });
    await act(async () => {
      await result.current.onDeletePost(Post());
    });
    const saved = store.get(savedPostStateAtom).savedPosts;
    expect(saved.map((s) => s.postId)).toEqual(["p9"]);
  });

  it("rolls back by re-appending the post and returns false on failure", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post({ id: "p1" }), Post({ id: "p2" })],
      postVotes: [],
    });
    mocks.deletePost.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useHarness(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onDeletePost(Post({ id: "p1" }));
    });
    expect(ok).toBe(false);
    // rollback re-appends; original order not guaranteed
    expect(
      store
        .get(postStateAtom)
        .posts.map((p) => p.id)
        .sort(),
    ).toEqual(["p1", "p2"]);
  });
});
