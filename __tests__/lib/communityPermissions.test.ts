/// <reference types="vitest" />

import {
  checkCommunityPermission,
  checkCommunityViewPermission,
} from "@/lib/community/communityPermissions";
import type { Community, CommunitySnippet } from "@/types/community";

const baseCommunity: Community = {
  id: "fitness",
  creatorId: "owner",
  numberOfMembers: 10,
  privacyType: "public",
};

const memberSnippets: CommunitySnippet[] = [{ communityId: "fitness" }];
const noMembership: CommunitySnippet[] = [];

describe("checkCommunityPermission", () => {
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
});

describe("checkCommunityViewPermission", () => {
  it("allows viewing restricted communities without membership", () => {
    const community = { ...baseCommunity, privacyType: "restricted" as const };

    expect(checkCommunityViewPermission(community, noMembership)).toBe(true);
  });

  it("only allows private communities for members", () => {
    const community = { ...baseCommunity, privacyType: "private" as const };

    expect(checkCommunityViewPermission(community, memberSnippets)).toBe(true);
    expect(checkCommunityViewPermission(community, noMembership)).toBe(false);
  });
});
