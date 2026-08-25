/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getComments: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/comments/getComments", () => ({
  getComments: mocks.getComments,
}));

// The real useCustomToast returns a useCallback with [] deps; keep the mock
// referentially stable or loadComments changes identity each render and the
// fetch effect loops forever.
vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import useCommentList from "@/hooks/comments/useCommentList";
import { Post } from "../posts/helpers";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("useCommentList", () => {
  it("starts in loading state with no comments", () => {
    const { result } = renderHook(() => useCommentList(null));
    expect(result.current.comments).toEqual([]);
    expect(result.current.commentFetchLoading).toBe(true);
  });

  it("fetches comments when a post is selected", async () => {
    const comments = [{ id: "cm1" }, { id: "cm2" }] as never[];
    mocks.getComments.mockResolvedValue(comments);
    const post = Post(); // stable reference: Post() inside renderHook would create a new object per render and loop the effect
    const { result } = renderHook(() => useCommentList(post));
    await waitFor(() => expect(result.current.commentFetchLoading).toBe(false));
    expect(mocks.getComments).toHaveBeenCalledWith("p1");
    expect(result.current.comments).toEqual(comments);
  });

  it("refetches when the selected post changes", async () => {
    mocks.getComments.mockResolvedValue([]);
    type P = ReturnType<typeof Post>;
    const { rerender } = renderHook(
      ({ post }: { post: P }) => useCommentList(post),
      {
        initialProps: { post: Post({ id: "p1" }) },
      },
    );
    rerender({ post: Post({ id: "p2" }) });
    await waitFor(() =>
      expect(mocks.getComments).toHaveBeenLastCalledWith("p2"),
    );
    expect(mocks.getComments).toHaveBeenCalledTimes(2);
  });

  it("does not fetch without a selected post", async () => {
    renderHook(() => useCommentList(null));
    await act(async () => {});
    expect(mocks.getComments).not.toHaveBeenCalled();
  });

  it("shows an error toast and clears loading on failure", async () => {
    mocks.getComments.mockRejectedValue(new Error("boom"));
    const post = Post();
    const { result } = renderHook(() => useCommentList(post));
    await waitFor(() => expect(result.current.commentFetchLoading).toBe(false));
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("loadComments can be invoked manually to reload", async () => {
    mocks.getComments
      .mockResolvedValueOnce([{ id: "cm1" }])
      .mockResolvedValueOnce([{ id: "cm1" }, { id: "cm2" }]);
    const post = Post();
    const { result } = renderHook(() => useCommentList(post));
    await waitFor(() => expect(result.current.comments).toHaveLength(1), {
      timeout: 3000,
    });
    await act(async () => {
      await result.current.loadComments();
    });
    expect(result.current.comments).toHaveLength(2);
  });

  it("setComments allows local mutation (optimistic add)", async () => {
    mocks.getComments.mockResolvedValue([]);
    const { result } = renderHook(() => useCommentList(Post()));
    await waitFor(() => expect(result.current.comments).toEqual([]), {
      timeout: 3000,
    });
    act(() => {
      result.current.setComments((prev) => [
        { id: "cm-new" } as never,
        ...prev,
      ]);
    });
    expect(result.current.comments[0].id).toBe("cm-new");
  });
});
