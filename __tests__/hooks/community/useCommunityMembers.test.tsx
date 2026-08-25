/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchCommunityMembers: vi.fn(),
}));

vi.mock("@/lib/community/fetchCommunityMembers", () => ({
  fetchCommunityMembers: mocks.fetchCommunityMembers,
}));

import useCommunityMembers from "@/hooks/community/useCommunityMembers";

describe("useCommunityMembers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts empty with no error", () => {
    const { result } = renderHook(() => useCommunityMembers());
    expect(result.current.members).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("loads members and clears loading", async () => {
    const members = [{ userId: "u1" }, { userId: "u2" }];
    mocks.fetchCommunityMembers.mockResolvedValue(members);
    const { result } = renderHook(() => useCommunityMembers());
    await act(async () => {
      await result.current.loadMembers("c1");
    });
    expect(mocks.fetchCommunityMembers).toHaveBeenCalledWith("c1");
    expect(result.current.members).toEqual(members);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets loading during fetch", async () => {
    let resolve!: (v: unknown) => void;
    mocks.fetchCommunityMembers.mockReturnValue(
      new Promise((r) => (resolve = r)),
    );
    const { result } = renderHook(() => useCommunityMembers());
    const p = result.current.loadMembers("c1");
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve([]);
    });

    await p;

    expect(result.current.loading).toBe(false);
  });

  it("sets error and empties members on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.fetchCommunityMembers.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCommunityMembers());
    await act(async () => {
      await result.current.loadMembers("c1");
    });
    expect(result.current.error).toBe("denied");
    expect(result.current.members).toEqual([]);
    expect(result.current.loading).toBe(false);
    vi.restoreAllMocks();
  });

  it("falls back to a generic error message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.fetchCommunityMembers.mockRejectedValue("non-error");
    const { result } = renderHook(() => useCommunityMembers());
    await act(async () => {
      await result.current.loadMembers("c1");
    });
    expect(result.current.error).toBe("Failed to load members");
    vi.restoreAllMocks();
  });

  it("replaces previous members on subsequent loads", async () => {
    mocks.fetchCommunityMembers
      .mockResolvedValueOnce([{ userId: "u1" }])
      .mockResolvedValueOnce([{ userId: "u2" }]);
    const { result } = renderHook(() => useCommunityMembers());
    await act(async () => {
      await result.current.loadMembers("c1");
    });
    await act(async () => {
      await result.current.loadMembers("c2");
    });
    expect(result.current.members).toEqual([{ userId: "u2" }]);
  });
});

import { act } from "@testing-library/react";
import { beforeEach } from "vitest";
