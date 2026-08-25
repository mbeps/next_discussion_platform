/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, useAtomValue, useSetAtom, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  joinCommunity: vi.fn(),
  leaveCommunity: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("@/lib/community/joinCommunity", () => ({
  joinCommunity: mocks.joinCommunity,
}));

vi.mock("@/lib/community/leaveCommunity", () => ({
  leaveCommunity: mocks.leaveCommunity,
}));

import { authModalStateAtom } from "@/atoms/authModalAtom";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import useCommunityMembershipActions from "@/hooks/community/useCommunityMembershipActions";
import { Community } from "@/types/community";

// One shared store per test so writes from the hook are visible to readers.
let store: ReturnType<typeof createStore>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const readAtom = <T,>(anAtom: Parameters<typeof useAtomValue>[0]): T =>
  renderHook(() => useAtomValue(anAtom), { wrapper }).result.current;

const community = (over: Partial<Community> = {}): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  ...over,
});

describe("useCommunityMembershipActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    mocks.joinCommunity.mockResolvedValue({ communityId: "c1" });
    mocks.leaveCommunity.mockResolvedValue(undefined);
  });

  it("opens the auth modal instead of acting when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), false);
    });
    expect(mocks.joinCommunity).not.toHaveBeenCalled();
    expect(mocks.leaveCommunity).not.toHaveBeenCalled();
    expect(readAtom(authModalStateAtom)).toEqual({ open: true, view: "login" });
  });

  it("joins when not joined and authenticated", async () => {
    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), false);
    });
    // Real contract: (userId, communityId, imageURL, isCreatorOrAdmin)
    expect(mocks.joinCommunity).toHaveBeenCalledWith("u1", "c1", "", false);
    expect(mocks.leaveCommunity).not.toHaveBeenCalled();
  });

  it("leaves when already joined", async () => {
    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), true);
    });
    expect(mocks.leaveCommunity).toHaveBeenCalledWith("u1", "c1");
    expect(mocks.joinCommunity).not.toHaveBeenCalled();
  });

  it("appends the snippet to the atom on join", async () => {
    const snippet = { communityId: "c1", imageURL: "", isAdmin: false };
    mocks.joinCommunity.mockResolvedValue(snippet);
    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), false);
    });
    expect(readAtom(communityStateAtom).mySnippets).toContainEqual(snippet);
  });

  it("increments member count when joining current community", async () => {
    const seed = renderHook(() => useSetAtom(communityStateAtom), { wrapper });
    act(() => {
      seed.result.current((prev) => ({
        ...prev,
        currentCommunity: community(),
      }));
    });

    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), false);
    });

    expect(readAtom(communityStateAtom).currentCommunity?.numberOfMembers).toBe(
      6,
    );
  });

  it("does not touch other communities' counts on join", async () => {
    const seed = renderHook(() => useSetAtom(communityStateAtom), { wrapper });
    act(() => {
      seed.result.current((prev) => ({
        ...prev,
        currentCommunity: community({ id: "other" }),
      }));
    });

    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), false);
    });

    expect(readAtom(communityStateAtom).currentCommunity?.numberOfMembers).toBe(
      5,
    );
  });

  it("removes the snippet from the atom on leave", async () => {
    const seed = renderHook(() => useSetAtom(communityStateAtom), { wrapper });
    act(() => {
      seed.result.current((prev) => ({
        ...prev,
        mySnippets: [{ communityId: "c1", imageURL: "", isAdmin: false }],
      }));
    });

    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    await act(async () => {
      result.current.onJoinOrLeaveCommunity(community(), true);
    });
    expect(readAtom(communityStateAtom).mySnippets).toEqual([]);
  });

  it("exposes combined loading flag", async () => {
    let resolve!: (v: unknown) => void;
    mocks.joinCommunity.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCommunityMembershipActions(), {
      wrapper,
    });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.onJoinOrLeaveCommunity(community(), false);
    });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve({ communityId: "c1" });
      await pending;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
