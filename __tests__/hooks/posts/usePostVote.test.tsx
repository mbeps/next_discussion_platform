/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { createStore, Provider, useAtomValue, useSetAtom } from "jotai";
import type { MouseEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  handlePostVote: vi.fn(),
  getPostVotes: vi.fn(),
  getPost: vi.fn(),
  getCommunityData: vi.fn(),
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

vi.mock("@/lib/posts/handlePostVote", () => ({
  handlePostVote: mocks.handlePostVote,
}));
vi.mock("@/lib/posts/getPostVotes", () => ({
  getPostVotes: mocks.getPostVotes,
}));
vi.mock("@/lib/posts/getPost", () => ({
  getPost: mocks.getPost,
}));
vi.mock("@/lib/community/getCommunityData", () => ({
  getCommunityData: mocks.getCommunityData,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { authModalStateAtom } from "@/atoms/authModalAtom";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { postStateAtom } from "@/atoms/postsAtom";
import usePostVote from "@/hooks/posts/usePostVote";
import { CommunityFixture, Post, Snippet, Vote } from "./helpers";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

// Live harness: reads the atom reactively so the hook always sees fresh state
function useLiveHarness() {
  const state = useAtomValue(postStateAtom);
  const setPostStateValue = useSetAtom(postStateAtom);
  return usePostVote(state, setPostStateValue);
}

const fakeEvent = () =>
  ({ stopPropagation: vi.fn() }) as unknown as MouseEvent<SVGElement>;

beforeEach(() => {
  // resetAllMocks (not clearAllMocks): mockResolvedValue implementations would
  // otherwise leak across tests (e.g. the private-community stub blocking votes)
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = createStore();
  mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
});

describe("usePostVote.onVote — auth gating", () => {
  it("opens the login modal instead of voting when logged out", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(mocks.handlePostVote).not.toHaveBeenCalled();
    expect(store.get(authModalStateAtom)).toEqual({
      open: true,
      view: "login",
    });
  });
});

describe("usePostVote.onVote — permission checks", () => {
  it("blocks non-members on restricted communities with an error toast", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
    }));
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(mocks.handlePostVote).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("blocks non-members on private communities fetched on demand", async () => {
    mocks.getCommunityData.mockResolvedValue(
      CommunityFixture({ id: "c9", privacyType: "private" }),
    );
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(
        fakeEvent(),
        Post({ communityId: "c9" }),
        1,
        "c9",
      );
    });
    expect(mocks.handlePostVote).not.toHaveBeenCalled();
    expect(mocks.getCommunityData).toHaveBeenCalledWith("c9");
  });

  it("allows members to vote in restricted communities", async () => {
    store.set(communityStateAtom, (prev) => ({
      ...prev,
      currentCommunity: CommunityFixture({ privacyType: "restricted" }),
      mySnippets: [Snippet()],
    }));
    mocks.handlePostVote.mockResolvedValue({
      voteChange: 1,
      newVote: Vote(),
    });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(mocks.handlePostVote).toHaveBeenCalled();
  });

  it("allows non-members to vote in public communities without fetching", async () => {
    mocks.handlePostVote.mockResolvedValue({ voteChange: 1, newVote: Vote() });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(mocks.handlePostVote).toHaveBeenCalled();
    expect(mocks.toast).not.toHaveBeenCalled();
  });
});

describe("usePostVote.onVote — optimistic deltas", () => {
  it.each([
    ["create upvote", { voteChange: 1, newVote: Vote() }, 5, 6],
    [
      "create downvote",
      { voteChange: -1, newVote: Vote({ voteValue: -1 }) },
      5,
      4,
    ],
    [
      "toggle-off applies -vote",
      { voteChange: -1, voteIdToDelete: "v1" },
      5,
      4,
    ],
    ["switch applies 2*vote", { voteChange: 2, newVote: Vote() }, 3, 5],
  ])("%s", async (_name, result_, initial, expected) => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post({ voteStatus: initial })],
      postVotes: [Vote()],
    });
    mocks.handlePostVote.mockResolvedValue(result_);
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(
        fakeEvent(),
        Post({ voteStatus: initial }),
        1,
        "c1",
      );
    });
    expect(store.get(postStateAtom).posts[0].voteStatus).toBe(expected);
  });

  it("removes the deleted vote record on toggle-off", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [Vote()],
    });
    mocks.handlePostVote.mockResolvedValue({
      voteChange: -1,
      voteIdToDelete: "v1",
    });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(store.get(postStateAtom).postVotes).toEqual([]);
  });

  it("replaces the existing vote record on switch", async () => {
    const newVote = Vote({ id: "v2", voteValue: -1 });
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [Vote()],
    });
    mocks.handlePostVote.mockResolvedValue({ voteChange: 2, newVote });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), -1, "c1");
    });
    expect(store.get(postStateAtom).postVotes).toEqual([newVote]);
  });

  it("appends a brand-new vote record on create", async () => {
    const newVote = Vote({ id: "v-new" });
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post()],
      postVotes: [],
    });
    mocks.handlePostVote.mockResolvedValue({ voteChange: 1, newVote });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(fakeEvent(), Post(), 1, "c1");
    });
    expect(store.get(postStateAtom).postVotes).toEqual([newVote]);
  });

  it("also updates selectedPost when one is selected", async () => {
    store.set(postStateAtom, {
      selectedPost: Post({ voteStatus: 10 }),
      posts: [Post({ voteStatus: 10 })],
      postVotes: [],
    });
    mocks.handlePostVote.mockResolvedValue({ voteChange: 1, newVote: Vote() });
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(
        fakeEvent(),
        Post({ voteStatus: 10 }),
        1,
        "c1",
      );
    });
    expect(store.get(postStateAtom).selectedPost?.voteStatus).toBe(11);
  });

  it("rolls back nothing but shows error toast when handlePostVote rejects", async () => {
    store.set(postStateAtom, {
      selectedPost: null,
      posts: [Post({ voteStatus: 7 })],
      postVotes: [],
    });
    mocks.handlePostVote.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.onVote(
        fakeEvent(),
        Post({ voteStatus: 7 }),
        1,
        "c1",
      );
    });
    // no optimistic change persisted
    expect(store.get(postStateAtom).posts[0].voteStatus).toBe(7);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });
});

describe("usePostVote helpers", () => {
  it("getPostVotes fetches and stores votes for given ids", async () => {
    mocks.getPostVotes.mockResolvedValue([Vote()]);
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.getPostVotes(["p1"]);
    });
    expect(mocks.getPostVotes).toHaveBeenCalledWith("u1", ["p1"]);
    expect(store.get(postStateAtom).postVotes).toEqual([Vote()]);
  });

  it("getPostVotes skips empty id lists", async () => {
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    await act(async () => {
      await result.current.getPostVotes([]);
    });
    expect(mocks.getPostVotes).not.toHaveBeenCalled();
  });

  it("getPost fetches and selects a post", async () => {
    mocks.getPost.mockResolvedValue(Post({ id: "p9" }));
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    let got: unknown;
    await act(async () => {
      got = await result.current.getPost("p9");
    });
    expect(got).toEqual(Post({ id: "p9" }));
    expect(store.get(postStateAtom).selectedPost?.id).toBe("p9");
  });

  it("getPost returns null on failure", async () => {
    mocks.getPost.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useLiveHarness(), { wrapper });
    let got: unknown;
    await act(async () => {
      got = await result.current.getPost("p9");
    });
    expect(got).toBeNull();
  });
});
