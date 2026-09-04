/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCommunities: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/community/getCommunities", () => ({
  getCommunities: mocks.getCommunities,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import useCommunitiesFeed from "@/hooks/community/useCommunitiesFeed";
import type { Community } from "@/types/community";

const community = (i: number): Community => ({
  id: `c${i}`,
  creatorId: "u1",
  numberOfMembers: i,
  privacyType: "public",
});

const page = (n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => community(i + offset));

const cursor = (v: string) => ({ id: v }) as never;

describe("useCommunitiesFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the initial page on mount", async () => {
    mocks.getCommunities.mockResolvedValue({
      communities: page(10),
      newLastVisible: cursor("c10"),
    });
    const { result } = renderHook(() => useCommunitiesFeed({}));
    await waitFor(() => expect(result.current.communities).toHaveLength(10));
    expect(mocks.getCommunities).toHaveBeenCalledWith(10, null);
    expect(result.current.noMoreCommunities).toBe(false);
  });

  it("uses a custom limitValue", async () => {
    mocks.getCommunities.mockResolvedValue({
      communities: page(5),
      newLastVisible: null,
    });
    const { result } = renderHook(() => useCommunitiesFeed({ limitValue: 5 }));
    await waitFor(() => expect(result.current.communities).toHaveLength(5));
    expect(mocks.getCommunities).toHaveBeenCalledWith(5, null);
  });

  it("marks noMoreCommunities when the page is smaller than the limit", async () => {
    mocks.getCommunities.mockResolvedValue({
      communities: page(3),
      newLastVisible: null,
    });
    const { result } = renderHook(() => useCommunitiesFeed({}));
    await waitFor(() => expect(result.current.noMoreCommunities).toBe(true));
  });

  it("does not paginate without pagination enabled even with a cursor", async () => {
    mocks.getCommunities.mockResolvedValueOnce({
      communities: page(10),
      newLastVisible: cursor("c10"),
    });
    const { result } = renderHook(() =>
      useCommunitiesFeed({ isPagination: false }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.fetchCommunities();
    });
    expect(mocks.getCommunities).toHaveBeenCalledTimes(1);
  });

  it("advances the cursor and appends on paginated fetch", async () => {
    mocks.getCommunities
      .mockResolvedValueOnce({
        communities: page(10),
        newLastVisible: cursor("c10"),
      })
      .mockResolvedValueOnce({
        communities: page(10, 10),
        newLastVisible: cursor("c20"),
      });
    const { result } = renderHook(() =>
      useCommunitiesFeed({ isPagination: true }),
    );
    await waitFor(() => expect(result.current.communities).toHaveLength(10));
    await act(async () => {
      await result.current.fetchCommunities();
    });
    expect(mocks.getCommunities).toHaveBeenLastCalledWith(10, cursor("c10"));
    expect(result.current.communities).toHaveLength(20);
    expect(result.current.communities[10].id).toBe("c10");
  });

  it("blocks concurrent fetches while loading", async () => {
    let resolve!: (v: unknown) => void;
    mocks.getCommunities.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() =>
      useCommunitiesFeed({ isPagination: true }),
    );
    // wait for mount fetch to be in-flight
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      await result.current.fetchCommunities();
    });
    expect(mocks.getCommunities).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve({ communities: page(10), newLastVisible: null });
    });
  });

  it("shows an error toast on fetch failure and clears loading", async () => {
    mocks.getCommunities.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCommunitiesFeed({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "Could not Find Communities",
      }),
    );
    expect(result.current.communities).toEqual([]);
  });

  it("keeps existing communities when a later page fails", async () => {
    mocks.getCommunities
      .mockResolvedValueOnce({
        communities: page(10),
        newLastVisible: cursor("c10"),
      })
      .mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() =>
      useCommunitiesFeed({ isPagination: true }),
    );
    await waitFor(() => expect(result.current.communities).toHaveLength(10));
    await act(async () => {
      await result.current.fetchCommunities();
    });
    expect(result.current.communities).toHaveLength(10);
  });

  it("stops advancing once noMoreCommunities is set via short page append", async () => {
    mocks.getCommunities
      .mockResolvedValueOnce({
        communities: page(10),
        newLastVisible: cursor("c10"),
      })
      .mockResolvedValueOnce({
        communities: page(4, 10),
        newLastVisible: null,
      });
    const { result } = renderHook(() =>
      useCommunitiesFeed({ isPagination: true }),
    );
    await waitFor(() => expect(result.current.communities).toHaveLength(10));
    await act(async () => {
      await result.current.fetchCommunities();
    });
    expect(result.current.noMoreCommunities).toBe(true);
    expect(result.current.communities).toHaveLength(14);
  });

  it("loading toggles during initial fetch", async () => {
    let resolve!: (v: unknown) => void;
    mocks.getCommunities.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCommunitiesFeed({}));
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve({ communities: [], newLastVisible: null });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
