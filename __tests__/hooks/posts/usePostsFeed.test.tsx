/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, createStore, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPosts: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/posts/getPosts", () => ({
  getPosts: mocks.getPosts,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { postStateAtom } from "@/atoms/postsAtom";
import usePostsFeed from "@/hooks/posts/usePostsFeed";
import { Post } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

function useSeed() {
  const set = useSetAtom(postStateAtom);
  return set;
}
function useRead() {
  return useAtomValue(postStateAtom);
}

const page = (n: number) =>
  Array.from({ length: n }, (_, i) => Post({ id: `p${i}` }));

describe("usePostsFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    store = createStore();
  });

  it("initial fetch replaces posts and stores cursor", async () => {
    const snap = { id: "cursor" };
    mocks.getPosts.mockResolvedValue({ posts: page(10), newLastVisible: snap });
    const { result } = renderHook(() => usePostsFeed({ communityId: "c1" }), {
      wrapper,
    });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(mocks.getPosts).toHaveBeenCalledWith(
      "c1",
      undefined,
      undefined,
      null,
    );
    expect(store.get(postStateAtom).posts).toHaveLength(10);
    expect(result.current.noMorePosts).toBe(false);
  });

  it("sets noMorePosts when page is smaller than 10", async () => {
    mocks.getPosts.mockResolvedValue({
      posts: page(3),
      newLastVisible: { id: "cursor" },
    });
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(result.current.noMorePosts).toBe(true);
  });

  it("does not paginate without a cursor (noMorePosts on initial empty)", async () => {
    mocks.getPosts.mockResolvedValue({ posts: [], newLastVisible: null });
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(result.current.noMorePosts).toBe(true);
    // subsequent non-initial call is a no-op
    await act(async () => {
      await result.current.fetchPosts();
    });
    expect(mocks.getPosts).toHaveBeenCalledTimes(1);
  });

  it("appends next page and advances the cursor", async () => {
    const c1 = { id: "cursor1" };
    const c2 = { id: "cursor2" };
    mocks.getPosts
      .mockResolvedValueOnce({ posts: page(10), newLastVisible: c1 })
      .mockResolvedValueOnce({ posts: page(5), newLastVisible: c2 });
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    await act(async () => {
      await result.current.fetchPosts();
    });
    expect(mocks.getPosts).toHaveBeenLastCalledWith(
      undefined,
      undefined,
      undefined,
      c1,
    );
    expect(store.get(postStateAtom).posts).toHaveLength(15);
    expect(result.current.noMorePosts).toBe(true); // second page had < 10
  });

  it("guards against concurrent fetches while loading", async () => {
    let resolve!: (v: unknown) => void;
    mocks.getPosts.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    let first!: Promise<void>;
    act(() => {
      first = result.current.fetchPosts(true);
    });
    await waitFor(() => expect(result.current.loading).toBe(true));
    // second call while loading should be ignored
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(mocks.getPosts).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve({ posts: page(10), newLastVisible: { id: "c" } });
      await first;
    });
    expect(result.current.loading).toBe(false);
  });

  it("skips non-initial fetch when noMorePosts is already true", async () => {
    mocks.getPosts.mockResolvedValue({ posts: page(2), newLastVisible: null });
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    await act(async () => {
      await result.current.fetchPosts();
    });
    expect(mocks.getPosts).toHaveBeenCalledTimes(1);
  });

  it("shows an error toast when fetching fails", async () => {
    mocks.getPosts.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
    expect(result.current.loading).toBe(false);
  });

  it("resets posts when the context changes", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [],
    });
    const { result, rerender } = renderHook(
      ({ communityId }) => usePostsFeed({ communityId }),
      { initialProps: { communityId: "c1" as string | undefined }, wrapper },
    );
    rerender({ communityId: "c2" });
    await waitFor(() => expect(store.get(postStateAtom).posts).toEqual([]));
    expect(result.current.noMorePosts).toBe(false);
  });

  it("passes communityIds through for personalised home feed", async () => {
    mocks.getPosts.mockResolvedValue({ posts: [], newLastVisible: null });
    const { result } = renderHook(
      () => usePostsFeed({ communityIds: ["a", "b"] }),
      { wrapper },
    );
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(mocks.getPosts).toHaveBeenCalledWith(
      undefined,
      ["a", "b"],
      undefined,
      null,
    );
  });

  it("exposes loading false after success", async () => {
    mocks.getPosts.mockResolvedValue({ posts: page(10), newLastVisible: null });
    const { result } = renderHook(() => usePostsFeed({}), { wrapper });
    await act(async () => {
      await result.current.fetchPosts(true);
    });
    expect(result.current.loading).toBe(false);
    const read = renderHook(() => useRead(), { wrapper });
    expect(read.result.current.posts).toHaveLength(10);
    expect(useSeed).toBeDefined();
  });
});
