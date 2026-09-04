/// <reference types="vitest" />
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSearchData: vi.fn(),
}));

vi.mock("@/lib/search/getSearchData", () => ({
  getSearchData: mocks.getSearchData,
}));

import useSearch from "@/hooks/useSearch";
import { Community } from "@/types/community";
import { Post } from "@/types/post";
import { Timestamp } from "firebase/firestore";

const ts = Timestamp.fromDate(new Date("2026-01-01"));

const community = (id: string): Community => ({
  id,
  creatorId: "creator",
  numberOfMembers: 1,
  privacyType: "public",
});

const post = (over: Partial<Post>): Post => ({
  communityId: "c1",
  creatorId: "u1",
  creatorUsername: "alice",
  title: "",
  body: "",
  numberOfComments: 0,
  voteStatus: 0,
  createTime: ts,
  ...over,
});

const data = {
  communities: [community("NextJS"), community("react"), community("python")],
  posts: [
    post({ id: "p1", title: "Learning React", body: "hooks are great" }),
    post({ id: "p2", title: "Python tips", body: "use NEXT.JS today" }),
    post({ id: "p3", title: "Unrelated", body: "nothing here" }),
  ],
};

describe("useSearch", () => {
  beforeEach(() => {
    mocks.getSearchData.mockReset().mockResolvedValue(data);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("preloads search data once on mount and reports loading until ready", async () => {
    const { result, rerender } = renderHook(() => useSearch(""));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender();
    rerender();
    expect(mocks.getSearchData).toHaveBeenCalledTimes(1);
  });

  it("returns empty results when term is empty", async () => {
    const { result } = renderHook(() => useSearch(""));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual({ communities: [], posts: [] });
  });

  it("filters communities case-insensitively by id", async () => {
    const { result } = renderHook(() => useSearch("NEXT"));
    await waitFor(() =>
      expect(result.current.results.communities).toHaveLength(1),
    );
    expect(result.current.results.communities[0].id).toBe("NextJS");
  });

  it("filters posts by title or body case-insensitively", async () => {
    const { result } = renderHook(() => useSearch("next.js"));
    await waitFor(() => expect(result.current.results.posts).toHaveLength(1));
    expect(result.current.results.posts[0].id).toBe("p2");
  });

  it("matches posts by body text", async () => {
    const { result } = renderHook(() => useSearch("HOOKS"));
    await waitFor(() => expect(result.current.results.posts).toHaveLength(1));
    expect(result.current.results.posts[0].id).toBe("p1");
  });

  it("clears results when the term becomes empty again", async () => {
    const { result, rerender } = renderHook(
      ({ term }: { term: string }) => useSearch(term),
      { initialProps: { term: "react" } },
    );
    await waitFor(() =>
      expect(result.current.results.communities).toHaveLength(1),
    );
    rerender({ term: "" });
    await waitFor(() =>
      expect(result.current.results).toEqual({ communities: [], posts: [] }),
    );
  });

  it("returns no matches for unknown terms", async () => {
    const { result } = renderHook(() => useSearch("zzzz"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual({ communities: [], posts: [] });
  });

  it("survives fetch errors and keeps empty results", async () => {
    mocks.getSearchData.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSearch("react"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual({ communities: [], posts: [] });
  });
});
