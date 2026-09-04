/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, useAtomValue, useSetAtom, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  removeCommunityAdmin: vi.fn(),
}));

vi.mock("@/lib/community/removeCommunityAdmin", () => ({
  removeCommunityAdmin: mocks.removeCommunityAdmin,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useRemoveAdmin from "@/hooks/admin/useRemoveAdmin";
import { Community } from "@/types/community";

const makeWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
const wrapper = makeWrapper();

const community = (adminIds?: string[]): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  adminIds,
});

function useSeed() {
  const set = useSetAtom(communityStateAtom);
  return (current?: Community) =>
    set((prev) => ({ ...prev, currentCommunity: current }));
}

describe("useRemoveAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.removeCommunityAdmin.mockResolvedValue(undefined);
  });

  it("calls the lib with community id and user id", async () => {
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleRemoveAdmin("c1", "u2");
    });
    expect(mocks.removeCommunityAdmin).toHaveBeenCalledWith("c1", "u2");
  });

  it("filters the user out via updateAdmins callback", async () => {
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    let applied: unknown;
    const updateAdmins = vi.fn((fn: (prev: { uid: string }[]) => unknown) => {
      applied = fn([{ uid: "u1" }, { uid: "u2" }] as never);
    });
    await act(async () => {
      await result.current.handleRemoveAdmin("c1", "u2", updateAdmins as never);
    });
    expect(applied).toEqual([{ uid: "u1" }]);
  });

  it("removes the uid from currentCommunity.adminIds in the atom", async () => {
    const wrapper = makeWrapper();
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community(["a0", "u2"]));
    });
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleRemoveAdmin("c1", "u2");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toEqual(["a0"]);
  });

  it("handles a community without adminIds", async () => {
    const wrapper = makeWrapper();
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community(undefined));
    });
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleRemoveAdmin("c1", "u2");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toEqual([]);
  });

  it("propagates lib errors to the caller", async () => {
    mocks.removeCommunityAdmin.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    await expect(
      act(async () => {
        await result.current.handleRemoveAdmin("c1", "u2");
      }),
    ).rejects.toThrow("denied");
  });

  it("does not mutate atom state when the lib fails", async () => {
    mocks.removeCommunityAdmin.mockRejectedValue(new Error("denied"));
    const wrapper = makeWrapper();
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community(["u2"]));
    });
    const { result } = renderHook(() => useRemoveAdmin(), { wrapper });
    await act(async () => {
      try {
        await result.current.handleRemoveAdmin("c1", "u2");
      } catch {
        /* expected */
      }
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toEqual(["u2"]);
  });
});
