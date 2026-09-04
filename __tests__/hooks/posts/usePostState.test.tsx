/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import usePostState from "@/hooks/posts/usePostState";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe("usePostState", () => {
  beforeEach(() => {
    store = createStore();
  });

  it("returns the default post state", () => {
    const { result } = renderHook(() => usePostState(), { wrapper });
    expect(result.current.postStateValue).toEqual({
      selectedPost: null,
      posts: [],
      postVotes: [],
    });
  });

  it("writes through to the shared atom", () => {
    const { result } = renderHook(() => usePostState(), { wrapper });
    act(() => {
      result.current.setPostStateValue((prev) => ({
        ...prev,
        posts: [{ id: "p1" } as never],
      }));
    });
    expect(result.current.postStateValue.posts).toHaveLength(1);
    // visible from a fresh reader on the same store
    const again = renderHook(() => usePostState(), { wrapper });
    expect(again.result.current.postStateValue.posts[0].id).toBe("p1");
  });
});
