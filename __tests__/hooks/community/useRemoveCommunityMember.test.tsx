/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  removeCommunityMember: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/community/removeCommunityMember", () => ({
  removeCommunityMember: mocks.removeCommunityMember,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import useRemoveCommunityMember from "@/hooks/community/useRemoveCommunityMember";

describe("useRemoveCommunityMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.removeCommunityMember.mockResolvedValue(undefined);
  });

  it("calls the lib with community and member ids and returns true", async () => {
    const { result } = renderHook(() => useRemoveCommunityMember());
    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeMember("c1", "u2");
    });
    expect(mocks.removeCommunityMember).toHaveBeenCalledWith("c1", "u2");
    expect(ok).toBe(true);
  });

  it("shows a success toast on success", async () => {
    const { result } = renderHook(() => useRemoveCommunityMember());
    await act(async () => {
      await result.current.removeMember("c1", "u2");
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", title: "User removed" }),
    );
  });

  it("returns false and shows error toast on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.removeCommunityMember.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useRemoveCommunityMember());
    let ok!: boolean;
    await act(async () => {
      ok = await result.current.removeMember("c1", "u2");
    });
    expect(ok).toBe(false);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        description: "denied",
      }),
    );
    vi.restoreAllMocks();
  });

  it("loading toggles during removal", async () => {
    let resolve!: (v: unknown) => void;
    mocks.removeCommunityMember.mockReturnValue(
      new Promise((r) => (resolve = r)),
    );
    const { result } = renderHook(() => useRemoveCommunityMember());
    const p = result.current.removeMember("c1", "u2");
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve(undefined);
    });

    await p;

    expect(result.current.loading).toBe(false);
  });

  it("loading is false after failure", async () => {
    mocks.removeCommunityMember.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useRemoveCommunityMember());
    await act(async () => {
      await result.current.removeMember("c1", "u2");
    });
    expect(result.current.loading).toBe(false);
  });
});
