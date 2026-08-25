/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, useAtomValue, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  useAuthState: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: mocks.collection,
  getDocs: (...args: unknown[]) => mocks.getDocs(...args),
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import { useCommunitySnippets } from "@/hooks/community/useCommunitySnippets";

const makeWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
const wrapper = makeWrapper();

const readAtom = (store = createStore()) =>
  renderHook(() => useAtomValue(communityStateAtom), {
    wrapper: makeWrapper(store),
  }).result.current;

describe("useCommunitySnippets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
  });

  it("fetches snippets and sets snippetFetched true for a logged-in user", async () => {
    mocks.getDocs.mockResolvedValue({
      docs: [{ data: () => ({ communityId: "c1" }) }],
    });
    const store = createStore();
    const wrapper = makeWrapper(store);
    const { result } = renderHook(() => useCommunitySnippets(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const state = readAtom(store);
    expect(state.mySnippets).toEqual([{ communityId: "c1" }]);
    expect(state.snippetFetched).toBe(true);
  });

  it("queries the correct user snippet subcollection", async () => {
    mocks.getDocs.mockResolvedValue({ docs: [] });
    renderHook(() => useCommunitySnippets(), { wrapper });
    await waitFor(() => expect(mocks.getDocs).toHaveBeenCalled());
    expect(mocks.collection).toHaveBeenCalledWith(
      {},
      "users/u1/communitySnippets",
    );
  });

  it("resets snippets and skips fetching when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    renderHook(() => useCommunitySnippets(), { wrapper });
    await waitFor(() => expect(readAtom().snippetFetched).toBe(false));
    expect(mocks.getDocs).not.toHaveBeenCalled();
    expect(readAtom().mySnippets).toEqual([]);
  });

  it("sets error and shows error toast on fetch failure", async () => {
    mocks.getDocs.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCommunitySnippets(), { wrapper });
    await waitFor(() => expect(result.current.error).toBe("boom"));
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "Subscriptions not Found",
      }),
    );
  });

  it("loading toggles during fetch", async () => {
    let resolve!: (v: unknown) => void;
    mocks.getDocs.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCommunitySnippets(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve({ docs: [] });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
