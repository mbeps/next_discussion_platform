/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateCommunityPrivacy: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/community/updateCommunityPrivacy", () => ({
  updateCommunityPrivacy: mocks.updateCommunityPrivacy,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useCommunityPrivacy from "@/hooks/community/useCommunityPrivacy";
import type { Community } from "@/types/community";

// One shared store per test so writes from the hook are visible to readers.
let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const community: Community = {
  id: "c1",
  creatorId: "u1",
  numberOfMembers: 5,
  privacyType: "public",
};

function useSeed() {
  const set = useSetAtom(communityStateAtom);
  return (current?: Community) =>
    set((prev) => ({ ...prev, currentCommunity: current }));
}

describe("useCommunityPrivacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.updateCommunityPrivacy.mockResolvedValue(undefined);
  });

  it("calls the lib with community id and new privacy type", async () => {
    const { result } = renderHook(() => useCommunityPrivacy(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.updatePrivacyType("private");
    });
    expect(mocks.updateCommunityPrivacy).toHaveBeenCalledWith("c1", "private");
  });

  it("updates currentCommunity privacyType in the atom on success", async () => {
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community);
    });
    const { result } = renderHook(() => useCommunityPrivacy(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.updatePrivacyType("restricted");
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.privacyType).toBe("restricted");
  });

  it("shows an error toast and does not update atom on failure", async () => {
    mocks.updateCommunityPrivacy.mockRejectedValue(new Error("boom"));
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed(community);
    });
    const { result } = renderHook(() => useCommunityPrivacy(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.updatePrivacyType("private");
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "Privacy Type not Updated",
      }),
    );
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.privacyType).toBe("public");
  });

  it("does not throw on failure", async () => {
    mocks.updateCommunityPrivacy.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCommunityPrivacy(community), {
      wrapper,
    });
    await expect(
      act(async () => {
        await result.current.updatePrivacyType("private");
      }),
    ).resolves.not.toThrow();
  });
});
