/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import type { User } from "firebase/auth";
import { createStore, Provider, useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createComment: vi.fn(),
  checkCommunityPermission: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/comments/createComment", () => ({
  createComment: mocks.createComment,
}));

vi.mock("@/lib/community/communityPermissions", () => ({
  checkCommunityPermission: mocks.checkCommunityPermission,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import { postStateAtom } from "@/atoms/postsAtom";
import useCreateComment from "@/hooks/comments/useCreateComment";
import { CommunityFixture, Post, Snippet } from "../posts/helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const user = { uid: "u1", email: "u1@test.com" } as unknown as User;

function useHarness(selectedPost: ReturnType<typeof Post>) {
  return useCreateComment(selectedPost, () => {});
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = createStore();
  store.set(postStateAtom, {
    selectedPost: Post({ numberOfComments: 3 }),
    posts: [],
    postVotes: [],
  });
});

describe("useCreateComment", () => {
  it("creates a comment and increments numberOfComments in the atom", async () => {
    mocks.createComment.mockResolvedValue({ id: "cm-new" });
    const setComments = vi.fn();
    const { result } = renderHook(
      () => useCreateComment(Post({ numberOfComments: 3 }), setComments),
      { wrapper },
    );
    await act(async () => {
      await result.current.createComment(user, "hello");
    });
    expect(mocks.createComment).toHaveBeenCalledWith(
      user,
      "c1",
      "p1",
      "Hello",
      "hello",
      0,
      undefined,
    );
    expect(setComments).toHaveBeenCalled();
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(4);
  });

  it("passes parentId and depth for replies", async () => {
    mocks.createComment.mockResolvedValue({ id: "cm2" });
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    await act(async () => {
      await result.current.createComment(user, "reply", "cm1", 1);
    });
    expect(mocks.createComment).toHaveBeenCalledWith(
      user,
      "c1",
      "p1",
      "Hello",
      "reply",
      1,
      "cm1",
    );
  });

  it("blocks non-permitted restricted communities without creating", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
    }));
    mocks.checkCommunityPermission.mockReturnValue(false);
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    await act(async () => {
      await result.current.createComment(user, "hi");
    });
    expect(mocks.createComment).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("allows permitted members to comment", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
      mySnippets: [Snippet()],
    }));
    mocks.checkCommunityPermission.mockReturnValue(true);
    mocks.createComment.mockResolvedValue({ id: "cm1" });
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    await act(async () => {
      await result.current.createComment(user, "hi");
    });
    expect(mocks.createComment).toHaveBeenCalled();
    expect(mocks.checkCommunityPermission).toHaveBeenCalledWith(
      CommunityFixture({ privacyType: "restricted" }),
      [Snippet()],
    );
  });

  it("skips permission check when commenting outside the viewed community", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({
        id: "other",
        privacyType: "private",
      }),
    }));
    mocks.createComment.mockResolvedValue({ id: "cm1" });
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    await act(async () => {
      await result.current.createComment(user, "hi");
    });
    expect(mocks.checkCommunityPermission).not.toHaveBeenCalled();
  });

  it("shows error toast on failure and does not increment count", async () => {
    mocks.createComment.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    await act(async () => {
      await result.current.createComment(user, "hi");
    });
    expect(store.get(postStateAtom).selectedPost?.numberOfComments).toBe(3);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("toggles createLoading during creation", async () => {
    let resolve!: (v: unknown) => void;
    mocks.createComment.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useHarness(Post()), { wrapper });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.createComment(user, "hi");
    });
    await waitFor(() => expect(result.current.createLoading).toBe(true));
    await act(async () => {
      resolve({ id: "cm1" });
      await pending;
    });
    expect(result.current.createLoading).toBe(false);
  });

  it("returns early when no post is selected", async () => {
    const { result } = renderHook(() => useCreateComment(null, () => {}), {
      wrapper,
    });
    await act(async () => {
      await result.current.createComment(user, "hi");
    });
    expect(mocks.createComment).not.toHaveBeenCalled();
  });
});
