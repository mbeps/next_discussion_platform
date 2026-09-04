/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
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

vi.mock("@/lib/community/leaveCommunity", () => ({
  leaveCommunity: mocks.leaveCommunity,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useLeaveCommunity from "@/hooks/community/useLeaveCommunity";
import type { Community } from "@/types/community";

// One shared store per test so writes from the hook are visible to readers.
let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const community = (over: Partial<Community> = {}): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  ...over,
});

function useSeed() {
  const set = useSetAtom(communityStateAtom);
  return (current?: Community, snippets = [{ communityId: "c1" }]) =>
    set((prev) => ({
      ...prev,
      currentCommunity: current,
      mySnippets: snippets,
    }));
}

describe("useLeaveCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    mocks.leaveCommunity.mockResolvedValue(undefined);
  });

  it("does nothing when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    expect(mocks.leaveCommunity).not.toHaveBeenCalled();
  });

  it("calls lib with uid and communityId", async () => {
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    expect(mocks.leaveCommunity).toHaveBeenCalledWith("u1", "c1");
  });

  it("removes the snippet from atom state", async () => {
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(undefined, [{ communityId: "c1" }, { communityId: "c2" }]);
    });
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.mySnippets).toEqual([{ communityId: "c2" }]);
  });

  it("decrements currentCommunity member count when leaving viewed community", async () => {
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community());
    });
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.numberOfMembers).toBe(4);
  });

  it("does not decrement other communities' counts", async () => {
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community({ id: "other" }));
    });
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.numberOfMembers).toBe(5);
  });

  it("sets error on failure and clears loading", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    mocks.leaveCommunity.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    await act(async () => {
      await result.current.leaveCommunity("c1");
    });
    expect(result.current.leaveError).toBe("nope");
    expect(result.current.leaveLoading).toBe(false);
    vi.restoreAllMocks();
  });

  it("loading toggles during leave", async () => {
    let resolve!: (v: unknown) => void;
    mocks.leaveCommunity.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useLeaveCommunity(), { wrapper });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.leaveCommunity("c1");
    });
    await waitFor(() => expect(result.current.leaveLoading).toBe(true));
    await act(async () => {
      resolve(undefined);
      await pending;
    });
    expect(result.current.leaveLoading).toBe(false);
  });
});
