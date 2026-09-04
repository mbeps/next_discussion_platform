/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, createStore, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  getCommunityPostVotes: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("@/lib/posts/getCommunityPostVotes", () => ({
  getCommunityPostVotes: mocks.getCommunityPostVotes,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import { postStateAtom } from "@/atoms/postsAtom";
import usePostVoteSync from "@/hooks/posts/usePostVoteSync";
import { CommunityFixture, Post, Vote } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

function useHarness() {
  const setPostStateValue = useSetAtom(postStateAtom);
  return usePostVoteSync(setPostStateValue);
}

describe("usePostVoteSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
  });

  it("fetches votes for the current community and merges into state", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture(),
    }));
    mocks.getCommunityPostVotes.mockResolvedValue([Vote()]);
    renderHook(() => useHarness(), { wrapper });
    await act(async () => {});
    expect(mocks.getCommunityPostVotes).toHaveBeenCalledWith("u1", "c1");
    expect(store.get(postStateAtom).postVotes).toEqual([Vote()]);
  });

  it("does nothing when logged out and clears postVotes", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [Vote()],
    });
    renderHook(() => useHarness(), { wrapper });
    await act(async () => {});
    expect(mocks.getCommunityPostVotes).not.toHaveBeenCalled();
    expect(store.get(postStateAtom).postVotes).toEqual([]);
  });

  it("skips fetching when no current community is set", async () => {
    renderHook(() => useHarness(), { wrapper });
    await act(async () => {});
    expect(mocks.getCommunityPostVotes).not.toHaveBeenCalled();
  });

  it("refetches when the current community changes", async () => {
    mocks.getCommunityPostVotes.mockResolvedValue([]);
    const { rerender } = renderHook(() => useHarness(), { wrapper });
    await act(async () => {});
    // set the current community
    act(() => {
      store.set(communityStateAtom, (prev) => ({
        ...prev,
        currentCommunity: CommunityFixture({ id: "c1" }),
      }));
    });
    await act(async () => {});
    // swap the current community and let the effect refetch
    act(() => {
      store.set(communityStateAtom, (prev) => ({
        ...prev,
        currentCommunity: CommunityFixture({ id: "c2" }),
      }));
    });
    await act(async () => {});
    expect(mocks.getCommunityPostVotes).toHaveBeenCalledTimes(2);
    expect(mocks.getCommunityPostVotes).toHaveBeenLastCalledWith("u1", "c2");
  });
});
