/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addCommunityAdmin: vi.fn(),
}));

vi.mock("@/lib/community/addCommunityAdmin", () => ({
  addCommunityAdmin: mocks.addCommunityAdmin,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useAddAdmin from "@/hooks/admin/useAddAdmin";
import type { Community } from "@/types/community";
import type { AdminUser } from "@/types/adminUser";

const makeWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
const wrapper = makeWrapper();

const adminUser: AdminUser = {
  uid: "u2",
  email: "u2@test.com",
  displayName: "User 2",
};

const community: Community = {
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
};

function useSeed() {
  const set = useSetAtom(communityStateAtom);
  return (current?: Community) =>
    set((prev) => ({ ...prev, currentCommunity: current }));
}

describe("useAddAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addCommunityAdmin.mockResolvedValue(undefined);
  });

  it("calls the lib with community id, new uid and image url", async () => {
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleAddAdmin("c1", adminUser, "img.png");
    });
    expect(mocks.addCommunityAdmin).toHaveBeenCalledWith("c1", "u2", "img.png");
  });

  it("appends the user via updateAdmins callback", async () => {
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    const updateAdmins = vi.fn((fn: (prev: never[]) => unknown) =>
      fn([] as never),
    );
    await act(async () => {
      await result.current.handleAddAdmin(
        "c1",
        adminUser,
        undefined,
        updateAdmins as never,
      );
    });
    expect(updateAdmins).toHaveBeenCalled();
  });

  it("does not call updateAdmins when not provided", async () => {
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleAddAdmin("c1", adminUser);
    });
    expect(mocks.addCommunityAdmin).toHaveBeenCalled();
  });

  it("adds the uid to currentCommunity.adminIds in the atom", async () => {
    const wrapper = makeWrapper();
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community);
    });
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleAddAdmin("c1", adminUser);
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toEqual(["u2"]);
  });

  it("preserves existing adminIds and tolerates missing adminIds", async () => {
    const wrapper = makeWrapper();
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed({ ...community, adminIds: ["a0"] });
    });
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await act(async () => {
      await result.current.handleAddAdmin("c1", adminUser);
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toEqual(["a0", "u2"]);
  });

  it("propagates lib errors to the caller", async () => {
    mocks.addCommunityAdmin.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await expect(
      act(async () => {
        await result.current.handleAddAdmin("c1", adminUser);
      }),
    ).rejects.toThrow("denied");
  });

  it("does not mutate atom state when the lib fails", async () => {
    mocks.addCommunityAdmin.mockRejectedValue(new Error("denied"));
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community);
    });
    const { result } = renderHook(() => useAddAdmin(), { wrapper });
    await act(async () => {
      try {
        await result.current.handleAddAdmin("c1", adminUser);
      } catch {
        /* expected */
      }
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.adminIds).toBeUndefined();
  });
});
