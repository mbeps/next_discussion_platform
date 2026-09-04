/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, useAtomValue, useSetAtom, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateCommunityImage: vi.fn(),
  deleteCommunityImage: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/community/updateCommunityImage", () => ({
  updateCommunityImage: mocks.updateCommunityImage,
}));

vi.mock("@/lib/community/deleteCommunityImage", () => ({
  deleteCommunityImage: mocks.deleteCommunityImage,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useCommunityImage from "@/hooks/community/useCommunityImage";
import { Community } from "@/types/community";

// One shared store per test so writes from the hook are visible to readers.
let store: ReturnType<typeof createStore>;
const makeWrapper =
  () =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
const wrapper = makeWrapper();

const community: Community = {
  id: "c1",
  creatorId: "u1",
  numberOfMembers: 5,
  privacyType: "public",
};

function useSeed() {
  const set = useSetAtom(communityStateAtom);
  return (
    current?: Community,
    snippets: { communityId: string; imageURL?: string }[] = [],
  ) =>
    set((prev) => ({
      ...prev,
      currentCommunity: current,
      mySnippets: snippets,
    }));
}

describe("useCommunityImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.updateCommunityImage.mockResolvedValue("https://new.url/img.png");
    mocks.deleteCommunityImage.mockResolvedValue(undefined);
  });

  describe("updateImage", () => {
    it("does nothing without a selected file", async () => {
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.updateImage("");
      });
      expect(mocks.updateCommunityImage).not.toHaveBeenCalled();
    });

    it("uploads and returns URL into atom currentCommunity", async () => {
      const wrapper = makeWrapper();
      const seed = renderHook(() => useSeed(), { wrapper }).result.current;
      await act(async () => {
        seed(community);
      });
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.updateImage("data:image/png;base64,x");
      });
      expect(mocks.updateCommunityImage).toHaveBeenCalledWith(
        "c1",
        "data:image/png;base64,x",
      );
      const state = renderHook(() => useAtomValue(communityStateAtom), {
        wrapper,
      }).result.current;
      expect(state.currentCommunity?.imageURL).toBe("https://new.url/img.png");
    });

    it("syncs the snippet imageURL for the matching community only", async () => {
      const wrapper = makeWrapper();
      const seed = renderHook(() => useSeed(), { wrapper }).result.current;
      await act(async () => {
        seed(community, [{ communityId: "c1" }, { communityId: "c2" }]);
      });
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.updateImage("data");
      });
      const state = renderHook(() => useAtomValue(communityStateAtom), {
        wrapper,
      }).result.current;
      expect(state.mySnippets[0].imageURL).toBe("https://new.url/img.png");
      expect(state.mySnippets[1].imageURL).toBeUndefined();
    });

    it("shows error toast on upload failure and clears uploading flag", async () => {
      mocks.updateCommunityImage.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.updateImage("data");
      });
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          title: "Image not Updated",
        }),
      );
      expect(result.current.uploadingImage).toBe(false);
    });

    it("uploading toggles during update", async () => {
      let resolve!: (v: unknown) => void;
      mocks.updateCommunityImage.mockReturnValue(
        new Promise((r) => (resolve = r)),
      );
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      let pending!: Promise<void>;
      act(() => {
        pending = result.current.updateImage("data");
      });
      expect(result.current.uploadingImage).toBe(true);
      await act(async () => {
        resolve("url");
        await pending;
      });
      expect(result.current.uploadingImage).toBe(false);
    });
  });

  describe("deleteCommunityImage", () => {
    it("clears imageURL in currentCommunity and snippets", async () => {
      const wrapper = makeWrapper();
      const seed = renderHook(() => useSeed(), { wrapper }).result.current;
      await act(async () => {
        seed({ ...community, imageURL: "old.png" }, [
          { communityId: "c1", imageURL: "old.png" },
        ]);
      });
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.deleteCommunityImage();
      });
      expect(mocks.deleteCommunityImage).toHaveBeenCalledWith("c1");
      const state = renderHook(() => useAtomValue(communityStateAtom), {
        wrapper,
      }).result.current;
      expect(state.currentCommunity?.imageURL).toBe("");
      expect(state.mySnippets[0].imageURL).toBe("");
    });

    it("shows error toast on delete failure", async () => {
      mocks.deleteCommunityImage.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useCommunityImage(community), {
        wrapper,
      });
      await act(async () => {
        await result.current.deleteCommunityImage();
      });
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          title: "Image not Deleted",
        }),
      );
    });
  });
});
