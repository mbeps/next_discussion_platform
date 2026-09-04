/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteCommunity: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/",
}));

vi.mock("@/lib/community/deleteCommunity", () => ({
  deleteCommunity: mocks.deleteCommunity,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import useDeleteCommunity from "@/hooks/community/useDeleteCommunity";
import type { Community } from "@/types/community";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

const community: Community = {
  id: "c1",
  creatorId: "u1",
  numberOfMembers: 5,
  privacyType: "public",
};

describe("useDeleteCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteCommunity.mockResolvedValue(undefined);
  });

  it("calls the lib with the community data", async () => {
    const { result } = renderHook(() => useDeleteCommunity(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.deleteCommunity();
    });
    expect(mocks.deleteCommunity).toHaveBeenCalledWith(community);
  });

  it("shows a success toast and redirects home on success", async () => {
    const { result } = renderHook(() => useDeleteCommunity(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.deleteCommunity();
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        title: "Community Deleted",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/");
  });

  it("shows an error toast and does not redirect on failure", async () => {
    mocks.deleteCommunity.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useDeleteCommunity(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.deleteCommunity();
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "Community not Deleted",
      }),
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("loading toggles during deletion", async () => {
    let resolve!: (v: unknown) => void;
    mocks.deleteCommunity.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useDeleteCommunity(community), {
      wrapper,
    });
    const p = result.current.deleteCommunity();
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve(undefined);
    });

    await p;

    expect(result.current.loading).toBe(false);
  });

  it("loading is false after an error", async () => {
    mocks.deleteCommunity.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useDeleteCommunity(community), {
      wrapper,
    });
    await act(async () => {
      await result.current.deleteCommunity();
    });
    expect(result.current.loading).toBe(false);
  });
});
