/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, useAtomValue, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  communityStateAtom,
  defaultCommunityState,
} from "@/atoms/communitiesAtom";
import useCommunityState from "@/hooks/community/useCommunityState";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

describe("useCommunityState", () => {
  it("returns the default atom value", () => {
    const { result } = renderHook(() => useCommunityState(), { wrapper });
    expect(result.current.communityStateValue).toEqual(defaultCommunityState);
    expect(result.current.communityStateValue.snippetFetched).toBe(false);
    expect(result.current.communityStateValue.mySnippets).toEqual([]);
  });

  it("exposes a setter that updates the shared atom", () => {
    const { result } = renderHook(() => useCommunityState(), { wrapper });
    act(() => {
      result.current.setCommunityStateValue((prev) => ({
        ...prev,
        snippetFetched: true,
        mySnippets: [{ communityId: "c1" }],
      }));
    });
    expect(result.current.communityStateValue.snippetFetched).toBe(true);
    expect(result.current.communityStateValue.mySnippets).toEqual([
      { communityId: "c1" },
    ]);
  });

  it("shares state across two hook instances in the same Provider", () => {
    // Both hooks must share one explicit store.
    const store = createStore();
    const sharedWrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const first = renderHook(() => useCommunityState(), {
      wrapper: sharedWrapper,
    });
    const second = renderHook(() => useCommunityState(), {
      wrapper: sharedWrapper,
    });
    act(() => {
      first.result.current.setCommunityStateValue((prev) => ({
        ...prev,
        snippetFetched: true,
      }));
    });
    expect(second.result.current.communityStateValue.snippetFetched).toBe(true);
  });

  it("is isolated between Providers", () => {
    const a = renderHook(() => useCommunityState(), { wrapper });
    const b = renderHook(() => useCommunityState(), { wrapper });
    act(() => {
      a.result.current.setCommunityStateValue((prev) => ({
        ...prev,
        snippetFetched: true,
      }));
    });
    expect(b.result.current.communityStateValue.snippetFetched).toBe(false);
  });

  it("atom default matches what a direct reader sees", () => {
    const { result } = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    });
    expect(result.current).toEqual(defaultCommunityState);
  });
});
