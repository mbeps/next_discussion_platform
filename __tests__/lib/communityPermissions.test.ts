/// <reference types="vitest" />

import {
  checkCommunityPermission,
  checkCommunityViewPermission,
  isSuperAdmin,
} from "@/lib/community/communityPermissions";
import { env } from "@/lib/env";
import type { Community, CommunitySnippet } from "@/types/community";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPER_ADMIN_UID: "super-admin-uid-123",
  },
}));

const baseCommunity: Community = {
  id: "fitness",
  creatorId: "owner",
  numberOfMembers: 10,
  privacyType: "public",
};

const memberSnippets: CommunitySnippet[] = [{ communityId: "fitness" }];
const noMembership: CommunitySnippet[] = [];

describe("isSuperAdmin", () => {
  beforeEach(() => {
    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "super-admin-uid-123";
  });

  it("returns true when userId matches NEXT_PUBLIC_SUPER_ADMIN_UID", () => {
    expect(isSuperAdmin("super-admin-uid-123")).toBe(true);
  });

  it("returns true when userId or configured UID has surrounding whitespace", () => {
    expect(isSuperAdmin("  super-admin-uid-123  ")).toBe(true);
  });

  it("strips surrounding single or double quotes from configured UID", () => {
    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = '"super-admin-uid-123"';
    expect(isSuperAdmin("super-admin-uid-123")).toBe(true);

    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "'super-admin-uid-123'";
    expect(isSuperAdmin("super-admin-uid-123")).toBe(true);
  });

  it("returns false for non-matching userId", () => {
    expect(isSuperAdmin("normal-user-uid")).toBe(false);
  });

  it("returns false for null, undefined, or empty userId", () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
    expect(isSuperAdmin("")).toBe(false);
    expect(isSuperAdmin("   ")).toBe(false);
  });

  it("returns false when NEXT_PUBLIC_SUPER_ADMIN_UID is not set or empty", () => {
    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = undefined;
    expect(isSuperAdmin("super-admin-uid-123")).toBe(false);

    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "";
    expect(isSuperAdmin("super-admin-uid-123")).toBe(false);

    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "   ";
    expect(isSuperAdmin("super-admin-uid-123")).toBe(false);
  });
});

describe("checkCommunityPermission", () => {
  beforeEach(() => {
    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "super-admin-uid-123";
  });

  it("allows actions in public communities", () => {
    expect(checkCommunityPermission(baseCommunity, noMembership)).toBeTruthy();
  });

  it("allows members in restricted communities", () => {
    const community = { ...baseCommunity, privacyType: "restricted" as const };

    expect(checkCommunityPermission(community, memberSnippets)).toBe(true);
  });

  it("blocks non-members in restricted communities", () => {
    const community = { ...baseCommunity, privacyType: "restricted" as const };

    expect(checkCommunityPermission(community, noMembership)).toBe(false);
  });

  it("allows only members in private communities", () => {
    const community = { ...baseCommunity, privacyType: "private" as const };

    expect(checkCommunityPermission(community, memberSnippets)).toBe(true);
    expect(checkCommunityPermission(community, noMembership)).toBe(false);
  });

  it("allows super admin in restricted communities without membership", () => {
    const community = { ...baseCommunity, privacyType: "restricted" as const };

    expect(
      checkCommunityPermission(community, noMembership, "super-admin-uid-123"),
    ).toBe(true);
  });

  it("allows super admin in private communities without membership", () => {
    const community = { ...baseCommunity, privacyType: "private" as const };

    expect(
      checkCommunityPermission(community, noMembership, "super-admin-uid-123"),
    ).toBe(true);
  });
});

describe("checkCommunityViewPermission", () => {
  beforeEach(() => {
    vi.mocked(env).NEXT_PUBLIC_SUPER_ADMIN_UID = "super-admin-uid-123";
  });

  it("allows viewing restricted communities without membership", () => {
    const community = { ...baseCommunity, privacyType: "restricted" as const };

    expect(checkCommunityViewPermission(community, noMembership)).toBe(true);
  });

  it("only allows private communities for members", () => {
    const community = { ...baseCommunity, privacyType: "private" as const };

    expect(checkCommunityViewPermission(community, memberSnippets)).toBe(true);
    expect(checkCommunityViewPermission(community, noMembership)).toBe(false);
  });

  it("allows super admin to view private communities without membership", () => {
    const community = { ...baseCommunity, privacyType: "private" as const };

    expect(
      checkCommunityViewPermission(
        community,
        noMembership,
        "super-admin-uid-123",
      ),
    ).toBe(true);
  });
});
