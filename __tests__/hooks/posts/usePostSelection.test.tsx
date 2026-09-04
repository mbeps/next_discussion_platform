/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

import { postStateAtom } from "@/atoms/postsAtom";
import usePostSelection from "@/hooks/posts/usePostSelection";
import { Post, Timestamp } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

function useHarness() {
  const setPostStateValue = useSetAtom(postStateAtom);
  return usePostSelection(setPostStateValue);
}

describe("usePostSelection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
  });

  it("sets selectedPost and navigates to the comments route", () => {
    const post = Post();
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.onSelectPost(post);
    });
    expect(store.get(postStateAtom).selectedPost?.id).toBe("p1");
    expect(mocks.push).toHaveBeenCalledWith("/community/c1/comments/p1");
  });

  it("preserves other state when selecting", () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [],
    });
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.onSelectPost(Post({ id: "p2" }));
    });
    const state = store.get(postStateAtom);
    expect(state.selectedPost?.id).toBe("p2");
    expect(state.posts).toHaveLength(1);
  });

  it("exposes Timestamp-based createTime untouched", () => {
    const post = Post();
    const { result } = renderHook(() => useHarness(), { wrapper });
    act(() => {
      result.current.onSelectPost(post);
    });
    expect(store.get(postStateAtom).selectedPost?.createTime).toBe(
      post.createTime,
    );
  });
});
