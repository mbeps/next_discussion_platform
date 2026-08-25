/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchCommunityAdmins: vi.fn(),
}));

vi.mock("@/lib/community/fetchCommunityAdmins", () => ({
  fetchCommunityAdmins: mocks.fetchCommunityAdmins,
}));

import useAdminList from "@/hooks/admin/useAdminList";

describe("useAdminList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with an empty list and not loading", () => {
    const { result } = renderHook(() => useAdminList());
    expect(result.current.admins).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("loads admins and clears loading", async () => {
    const admins = [{ uid: "a1" }, { uid: "a2" }];
    mocks.fetchCommunityAdmins.mockResolvedValue(admins);
    const { result } = renderHook(() => useAdminList());
    await act(async () => {
      await result.current.loadAdmins("creator", ["a1"]);
    });
    expect(mocks.fetchCommunityAdmins).toHaveBeenCalledWith("creator", ["a1"]);
    expect(result.current.admins).toEqual(admins);
    expect(result.current.loading).toBe(false);
  });

  it("sets loading during fetch", async () => {
    let resolve!: (v: unknown) => void;
    mocks.fetchCommunityAdmins.mockReturnValue(
      new Promise((r) => (resolve = r)),
    );
    const { result } = renderHook(() => useAdminList());
    const p = result.current.loadAdmins("creator");
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve([]);
    });

    await p;

    expect(result.current.loading).toBe(false);
  });

  it("empties the list and rethrows on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.fetchCommunityAdmins.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAdminList());
    await expect(
      act(async () => {
        await result.current.loadAdmins("creator");
      }),
    ).rejects.toThrow("boom");
    expect(result.current.admins).toEqual([]);
    expect(result.current.loading).toBe(false);
    vi.restoreAllMocks();
  });

  it("setAdmins allows manual updates", () => {
    const { result } = renderHook(() => useAdminList());
    act(() => {
      result.current.setAdmins([{ uid: "manual" }] as never);
    });
    expect(result.current.admins).toEqual([{ uid: "manual" }]);
  });

  it("replaces previous list on subsequent loads", async () => {
    mocks.fetchCommunityAdmins
      .mockResolvedValueOnce([{ uid: "a1" }])
      .mockResolvedValueOnce([{ uid: "b1" }]);
    const { result } = renderHook(() => useAdminList());
    await act(async () => {
      await result.current.loadAdmins("c1");
    });
    await act(async () => {
      await result.current.loadAdmins("c2");
    });
    expect(result.current.admins).toEqual([{ uid: "b1" }]);
  });
});
