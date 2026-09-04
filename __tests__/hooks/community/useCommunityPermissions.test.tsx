/// <reference types="vitest" />
import { renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  checkCommunityPermission: vi.fn(),
  checkCommunityViewPermission: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("@/lib/community/communityPermissions", () => ({
  checkCommunityPermission: mocks.checkCommunityPermission,
  checkCommunityViewPermission: mocks.checkCommunityViewPermission,
}));

import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import type { Community } from "@/types/community";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

const community = (over: Partial<Community> = {}): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  ...over,
});

describe("useCommunityPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    mocks.checkCommunityPermission.mockReturnValue(true);
    mocks.checkCommunityViewPermission.mockReturnValue(true);
  });

  it("returns all-false flags for undefined community but keeps loading", () => {
    const { result } = renderHook(() => useCommunityPermissions(), { wrapper });
    expect(result.current).toEqual({
      isCreator: false,
      isAdmin: false,
      canManageAdmins: false,
      canPost: false,
      canComment: false,
      canView: false,
      loading: true,
    });
  });

  it("identifies the creator as admin and manager", () => {
    mocks.useAuthState.mockReturnValue([{ uid: "creator" }, false, undefined]);
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    expect(result.current.isCreator).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canManageAdmins).toBe(true);
  });

  it("treats a member of adminIds as admin but not creator", () => {
    const { result } = renderHook(
      () => useCommunityPermissions(community({ adminIds: ["u1"] })),
      { wrapper },
    );
    expect(result.current.isCreator).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canManageAdmins).toBe(true);
  });

  it("non-admin non-creator is not admin", () => {
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    // isAdmin is undefined when the user is neither creator nor in adminIds
    expect(result.current.isAdmin).toBeFalsy();
    expect(result.current.canManageAdmins).toBeFalsy();
  });

  it("delegates canPost/canComment to checkCommunityPermission with snippets", () => {
    mocks.checkCommunityPermission.mockReturnValue(false);
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    expect(result.current.canPost).toBe(false);
    expect(result.current.canComment).toBe(false);
    expect(mocks.checkCommunityPermission).toHaveBeenCalledWith(
      community(),
      [],
    );
  });

  it("delegates canView to checkCommunityViewPermission", () => {
    mocks.checkCommunityViewPermission.mockReturnValue(false);
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    expect(result.current.canView).toBe(false);
  });

  it("loading is true while auth is resolving", async () => {
    mocks.useAuthState.mockReturnValue([undefined, true, undefined]);
    const { result, rerender } = renderHook(
      ({ c }) => useCommunityPermissions(c),
      { wrapper, initialProps: { c: community() } },
    );
    expect(result.current.loading).toBe(true);
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    rerender({ c: community() });
    // loading stays true until snippets are fetched for a logged-in user
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(result.current.loading).toBe(true);
  });

  it("loading stays true while snippets are unfetched for logged-in user", () => {
    // snippetFetched defaults to false in a fresh Provider
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("handles missing user gracefully (isAdmin false)", () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useCommunityPermissions(community()), {
      wrapper,
    });
    expect(result.current.isCreator).toBe(false);
    // isAdmin is undefined when the user is not in adminIds
    expect(result.current.isAdmin).toBeFalsy();
  });
});
