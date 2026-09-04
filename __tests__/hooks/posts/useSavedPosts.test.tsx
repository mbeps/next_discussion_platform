/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, createStore, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  getSavedPosts: vi.fn(),
  savePost: vi.fn(),
  unsavePost: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("@/lib/posts/getSavedPosts", () => ({
  getSavedPosts: mocks.getSavedPosts,
}));
vi.mock("@/lib/posts/savePost", () => ({
  savePost: mocks.savePost,
}));
vi.mock("@/lib/posts/unsavePost", () => ({
  unsavePost: mocks.unsavePost,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { authModalStateAtom } from "@/atoms/authModalAtom";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import useSavedPosts from "@/hooks/posts/useSavedPosts";
import { Post, SavedPostFixture } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

function useSeed() {
  const set = useSetAtom(savedPostStateAtom);
  return set;
}
function useRead() {
  return useAtomValue(savedPostStateAtom);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = createStore();
  mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
});

describe("useSavedPosts — bootstrap", () => {
  it("fetchSavedPosts loads saved posts into the atom", async () => {
    const saved = [SavedPostFixture()];
    mocks.getSavedPosts.mockResolvedValue(saved);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.fetchSavedPosts();
    });
    expect(mocks.getSavedPosts).toHaveBeenCalledWith("u1");
    expect(store.get(savedPostStateAtom).savedPosts).toEqual(saved);
    expect(result.current.loading).toBe(false);
  });

  it("does nothing when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.fetchSavedPosts();
    });
    expect(mocks.getSavedPosts).not.toHaveBeenCalled();
  });

  it("shows an error toast when fetching fails", async () => {
    mocks.getSavedPosts.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.fetchSavedPosts();
    });
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });
});

describe("useSavedPosts — toggle logic", () => {
  it("opens the auth modal instead of saving when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onSavePost(Post());
    });
    expect(mocks.savePost).not.toHaveBeenCalled();
    expect(store.get(authModalStateAtom)).toEqual({
      open: true,
      view: "login",
    });
  });

  it("saves an unsaved post and appends to state", async () => {
    const newSaved = SavedPostFixture({ id: "s-new" });
    mocks.savePost.mockResolvedValue(newSaved);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onSavePost(Post());
    });
    expect(mocks.savePost).toHaveBeenCalledWith("u1", Post());
    expect(store.get(savedPostStateAtom).savedPosts).toEqual([newSaved]);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Post saved" }),
    );
  });

  it("unsaves a saved post and removes it from state", async () => {
    store.set(savedPostStateAtom, (prev) => ({
      ...prev,
      savedPosts: [
        SavedPostFixture({ postId: "p1" }),
        SavedPostFixture({ id: "s2", postId: "p2" }),
      ],
    }));
    mocks.unsavePost.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onSavePost(Post());
    });
    expect(mocks.unsavePost).toHaveBeenCalledWith("u1", "p1");
    expect(mocks.savePost).not.toHaveBeenCalled();
    const remaining = store.get(savedPostStateAtom).savedPosts;
    expect(remaining.map((s) => s.postId)).toEqual(["p2"]);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Post removed from saved" }),
    );
  });

  it("shows error toast and keeps state on save failure", async () => {
    mocks.savePost.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onSavePost(Post());
    });
    expect(store.get(savedPostStateAtom).savedPosts).toEqual([]);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("onRemoveSavedPost removes by postId without auth modal for logged-in users", async () => {
    store.set(savedPostStateAtom, (prev) => ({
      ...prev,
      savedPosts: [SavedPostFixture()],
    }));
    mocks.unsavePost.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onRemoveSavedPost("p1");
    });
    expect(store.get(savedPostStateAtom).savedPosts).toEqual([]);
  });

  it("onRemoveSavedPost is a no-op when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    await act(async () => {
      await result.current.onRemoveSavedPost("p1");
    });
    expect(mocks.unsavePost).not.toHaveBeenCalled();
  });

  it("isPostSaved reflects current state", async () => {
    const seed = renderHook(() => useSeed(), { wrapper }).result.current;
    await act(async () => {
      seed((prev) => ({ ...prev, savedPosts: [SavedPostFixture()] }));
    });
    const { result } = renderHook(() => useSavedPosts(), { wrapper });
    expect(result.current.isPostSaved("p1")).toBe(true);
    expect(result.current.isPostSaved("p2")).toBe(false);
    // read hook sees same store
    expect(
      renderHook(() => useRead(), { wrapper }).result.current.savedPosts,
    ).toHaveLength(1);
  });
});
