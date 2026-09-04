/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider, useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteComment: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/comments/deleteComment", () => ({
  deleteComment: mocks.deleteComment,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { postStateAtom } from "@/atoms/postsAtom";
import useDeleteComment from "@/hooks/comments/useDeleteComment";
import type { Comment as AppComment } from "@/types/comment";
import { CommentFixture, Post } from "../posts/helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = createStore();
  store.set(postStateAtom, {
    selectedPost: Post({ numberOfComments: 5 }),
    posts: [],
    postVotes: [],
  });
});

function render(comments: ReturnType<typeof CommentFixture>[]) {
  let current = comments;
  const setComments = vi.fn(
    (fn: (prev: typeof comments) => typeof comments) => {
      current = fn(current);
      return current;
    },
  );
  const { result } = renderHook(
    () =>
      useDeleteComment(
        current,
        setComments as unknown as React.Dispatch<
          React.SetStateAction<AppComment[]>
        >,
      ),
    {
      wrapper,
    },
  );
  return { result, setComments, getComments: () => current };
}

describe("useDeleteComment", () => {
  it("deletes a top-level comment and decrements count by 1", async () => {
    mocks.deleteComment.mockResolvedValue(undefined);
    const h = render([CommentFixture({ id: "cm1" })]);
    await act(async () => {
      await h.result.current.deleteComment(CommentFixture({ id: "cm1" }));
    });
    expect(mocks.deleteComment).toHaveBeenCalledWith("cm1", "p1", []);
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(4);
    expect(h.getComments()).toEqual([]);
  });

  it("cascades to descendant replies and decrements by total removed", async () => {
    mocks.deleteComment.mockResolvedValue(undefined);
    const tree = [
      CommentFixture({ id: "root" }),
      CommentFixture({ id: "child1", parentId: "root" }),
      CommentFixture({ id: "grandchild", parentId: "child1" }),
      CommentFixture({ id: "unrelated" }),
    ];
    const h = render(tree);
    await act(async () => {
      await h.result.current.deleteComment(CommentFixture({ id: "root" }));
    });
    expect(mocks.deleteComment).toHaveBeenCalledWith("root", "p1", [
      "child1",
      "grandchild",
    ]);
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(2);
    expect(h.getComments().map((c) => c.id)).toEqual(["unrelated"]);
  });

  it("does not cascade siblings of the deleted comment", async () => {
    mocks.deleteComment.mockResolvedValue(undefined);
    const tree = [
      CommentFixture({ id: "a" }),
      CommentFixture({ id: "b", parentId: "a" }),
      CommentFixture({ id: "c", parentId: "a" }),
    ];
    const h = render(tree);
    await act(async () => {
      await h.result.current.deleteComment(CommentFixture({ id: "b" }));
    });
    expect(mocks.deleteComment).toHaveBeenCalledWith("b", "p1", []);
    expect(h.getComments().map((c) => c.id)).toEqual(["a", "c"]);
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(4);
  });

  it("shows error toast and keeps state on failure", async () => {
    mocks.deleteComment.mockRejectedValue(new Error("boom"));
    const h = render([CommentFixture()]);
    await act(async () => {
      await h.result.current.deleteComment(CommentFixture());
    });
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(5);
    expect(h.getComments()).toHaveLength(1);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("clears deleteLoadingId after completion", async () => {
    mocks.deleteComment.mockResolvedValue(undefined);
    const h = render([CommentFixture()]);
    await act(async () => {
      await h.result.current.deleteComment(CommentFixture());
    });
    expect(h.result.current.deleteLoadingId).toBe("");
  });

  it("sets deleteLoadingId during deletion", async () => {
    let resolve!: (v: unknown) => void;
    mocks.deleteComment.mockReturnValue(new Promise((r) => (resolve = r)));
    const h = render([CommentFixture({ id: "cm1" })]);
    let pending!: Promise<void>;
    act(() => {
      pending = h.result.current.deleteComment(CommentFixture({ id: "cm1" }));
    });
    expect(h.result.current.deleteLoadingId).toBe("cm1");
    await act(async () => {
      resolve(undefined);
      await pending;
    });
    expect(h.result.current.deleteLoadingId).toBe("");
  });
});
