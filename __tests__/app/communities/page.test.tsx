/// <reference types="vitest" />
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Communities from "@/app/communities/page";
import { theme } from "@/chakra/theme";
import type { Community, CommunitySnippet } from "@/types/community";

const mocks = vi.hoisted(() => ({
  communityStateValue: {
    mySnippets: [] as CommunitySnippet[],
    snippetsFetched: true,
  },
  onJoinOrLeaveCommunity: vi.fn(),
  fetchCommunities: vi.fn(),
  communities: [] as Community[],
  loadingFeed: false,
  noMoreCommunities: true,
}));

vi.mock("@/hooks/community/useCommunityState", () => ({
  default: () => ({
    communityStateValue: mocks.communityStateValue,
  }),
}));

vi.mock("@/hooks/community/useCommunityMembershipActions", () => ({
  default: () => ({
    onJoinOrLeaveCommunity: mocks.onJoinOrLeaveCommunity,
  }),
}));

vi.mock("@/hooks/community/useCommunitiesFeed", () => ({
  default: () => ({
    communities: mocks.communities,
    loading: mocks.loadingFeed,
    fetchCommunities: mocks.fetchCommunities,
    noMoreCommunities: mocks.noMoreCommunities,
  }),
}));

vi.mock("@/components/community/community-item/CommunityItem", () => ({
  default: ({
    community,
    isJoined,
  }: { community: Community; isJoined: boolean }) => (
    <div data-testid={`community-item-${community.id}`}>
      <span>{community.id}</span>
      <span>{isJoined ? "Joined" : "Not Joined"}</span>
    </div>
  ),
}));

vi.mock("@/components/community/PersonalHome", () => ({
  default: () => <div data-testid="personal-home" />,
}));

vi.mock("@/components/layout/PageContent", () => ({
  default: ({ children }: { children: ReactNode[] }) => (
    <div data-testid="page-content">{children}</div>
  ),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider value={theme}>{children}</ChakraProvider>
);

describe("Communities Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.communities = [
      { id: "comm-admin", numberOfMembers: 10 } as Community,
      { id: "comm-subscribed", numberOfMembers: 5 } as Community,
      { id: "comm-discover", numberOfMembers: 2 } as Community,
    ];
    mocks.communityStateValue = {
      mySnippets: [
        { communityId: "comm-admin", isAdmin: true },
        { communityId: "comm-subscribed", isAdmin: false },
      ],
      snippetsFetched: true,
    };
  });

  it("does not force all communities into Moderating for super admin, but partitions based on snippets", () => {
    render(<Communities />, { wrapper });

    expect(screen.getByText("Moderating")).toBeInTheDocument();
    expect(screen.getByText("My Communities")).toBeInTheDocument();
    expect(screen.getByText("Discover Communities")).toBeInTheDocument();

    expect(screen.getByTestId("community-item-comm-admin")).toBeInTheDocument();
    expect(
      screen.getByTestId("community-item-comm-subscribed"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("community-item-comm-discover"),
    ).toBeInTheDocument();
  });
});
