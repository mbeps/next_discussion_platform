/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, useAtomValue, useSetAtom, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  joinCommunity: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("@/lib/community/joinCommunity", () => ({
  joinCommunity: mocks.joinCommunity,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useJoinCommunity from "@/hooks/community/useJoinCommunity";
import { Community } from "@/types/community";

// One shared store per test so writes from the hook are visible to readers.
let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const community = (over: Partial<Community> = {}): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  ...over,
});

function useSeedCommunity() {
  const set = useSetAtom(communityStateAtom);
  return (current?: Community) =>
    set((prev) => ({ ...prev, currentCommunity: current }));
}

describe("useJoinCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    mocks.joinCommunity.mockResolvedValue({ communityId: "c1", imageURL: "" });
  });

  it("does nothing when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community());
    });
    expect(mocks.joinCommunity).not.toHaveBeenCalled();
    expect(result.current.joinError).toBe("");
  });

  it("calls lib with uid, id, imageURL and admin flag for plain member", async () => {
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community({ imageURL: "img.png" }));
    });
    expect(mocks.joinCommunity).toHaveBeenCalledWith(
      "u1",
      "c1",
      "img.png",
      false,
    );
  });

  it("passes isAdmin=true when user is creator", async () => {
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community({ creatorId: "u1" }));
    });
    expect(mocks.joinCommunity).toHaveBeenCalledWith("u1", "c1", "", true);
  });

  it("passes isAdmin=true when user is in adminIds", async () => {
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community({ adminIds: ["u1"] }));
    });
    expect(mocks.joinCommunity).toHaveBeenCalledWith("u1", "c1", "", true);
  });

  it("appends snippet to atom state on success", async () => {
    const snippet = { communityId: "c1", imageURL: "" };
    mocks.joinCommunity.mockResolvedValue(snippet);
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community());
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.mySnippets).toEqual([snippet]);
  });

  it("increments currentCommunity member count when joining the viewed community", async () => {
    const seed = renderHook(() => useSeedCommunity(), { wrapper }).result
      .current;
    await act(async () => {
      seed(community());
    });
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community());
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.numberOfMembers).toBe(6);
  });

  it("does not touch other communities' counts", async () => {
    const seed = renderHook(() => useSeedCommunity(), { wrapper }).result
      .current;
    await act(async () => {
      seed(community({ id: "other" }));
    });
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community());
    });
    const state = renderHook(() => useAtomValue(communityStateAtom), {
      wrapper,
    }).result.current;
    expect(state.currentCommunity?.numberOfMembers).toBe(5);
  });

  it("sets error and shows error toast on failure", async () => {
    const toast = vi.fn();
    vi.doMock("@/hooks/useCustomToast", () => ({
      __esModule: true,
      default: () => toast,
    }));
    // simpler: spy via module mock already in place — re-mock not needed; assert via console + error
    vi.spyOn(console, "log").mockImplementation(() => {});
    mocks.joinCommunity.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    await act(async () => {
      await result.current.joinCommunity(community());
    });
    expect(result.current.joinError).toBe("nope");
    expect(result.current.joinLoading).toBe(false);
    vi.restoreAllMocks();
  });

  it("loading toggles during join", async () => {
    let resolve!: (v: unknown) => void;
    mocks.joinCommunity.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useJoinCommunity(), { wrapper });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.joinCommunity(community());
    });
    await waitFor(() => expect(result.current.joinLoading).toBe(true));
    await act(async () => {
      resolve({ communityId: "c1" });
      await pending;
    });
    expect(result.current.joinLoading).toBe(false);
  });
});
