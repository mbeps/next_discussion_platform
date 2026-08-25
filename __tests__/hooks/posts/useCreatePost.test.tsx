/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, createStore, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPost: vi.fn(),
  back: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/posts/createPost", () => ({
  createPost: mocks.createPost,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mocks.back }),
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { communityStateAtom } from "@/atoms/communitiesAtom";
import useCreatePost from "@/hooks/posts/useCreatePost";
import { CommunityFixture, Snippet } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const user = { uid: "u1", email: "u1@test.com" } as unknown as User;

beforeEach(() => {
  vi.clearAllMocks();
  store = createStore();
});

describe("useCreatePost", () => {
  it("creates a post and navigates back with success toast", async () => {
    mocks.createPost.mockResolvedValue({});
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "B",
      });
    });
    expect(mocks.createPost).toHaveBeenCalledWith(
      user,
      "c1",
      undefined,
      { title: "T", body: "B" },
      undefined,
    );
    expect(mocks.back).toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success" }),
    );
    expect(result.current.error).toBe(false);
  });

  it("passes the selected file through for image uploads", async () => {
    mocks.createPost.mockResolvedValue({});
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(
        user,
        "c1",
        "img.png",
        { title: "T", body: "" },
        "data:image/png;base64,x",
      );
    });
    expect(mocks.createPost).toHaveBeenCalledWith(
      user,
      "c1",
      "img.png",
      { title: "T", body: "" },
      "data:image/png;base64,x",
    );
  });

  it("blocks non-members of restricted communities without creating", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
    }));
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "",
      });
    });
    expect(mocks.createPost).not.toHaveBeenCalled();
    expect(mocks.back).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("allows members of restricted communities to post", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
      mySnippets: [Snippet()],
    }));
    mocks.createPost.mockResolvedValue({});
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "",
      });
    });
    expect(mocks.createPost).toHaveBeenCalled();
  });

  it("skips permission check when posting outside the viewed community", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({
        id: "other",
        privacyType: "private",
      }),
    }));
    mocks.createPost.mockResolvedValue({});
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "",
      });
    });
    expect(mocks.createPost).toHaveBeenCalled();
  });

  it("sets error state and shows error toast on failure", async () => {
    mocks.createPost.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    await act(async () => {
      await result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "",
      });
    });
    expect(result.current.error).toBe(true);
    expect(mocks.back).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("toggles loading during creation", async () => {
    let resolve!: (v: unknown) => void;
    mocks.createPost.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.handleCreatePost(user, "c1", undefined, {
        title: "T",
        body: "",
      });
    });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve({});
      await pending;
    });
    expect(result.current.loading).toBe(false);
  });
});
