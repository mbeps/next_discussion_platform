/// <reference types="vitest" />
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { theme } from "@/chakra/theme";
import CommentItem from "@/components/posts/comments/CommentItem";
import type { Comment } from "@/types/comment";
import { TS } from "../hooks/posts/helpers";

const mocks = vi.hoisted(() => ({
  isSuperAdmin: vi.fn(),
  onDeleteComment: vi.fn(),
  onCreateComment: vi.fn(),
}));

vi.mock("@/lib/community/communityPermissions", () => ({
  isSuperAdmin: mocks.isSuperAdmin,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider value={theme}>{children}</ChakraProvider>
);

const baseComment: Comment = {
  id: "cm1",
  creatorId: "creator-user",
  creatorDisplayText: "Creator User",
  communityId: "comm1",
  postId: "p1",
  postTitle: "Test Post",
  text: "This is a comment",
  createdAt: TS,
};

describe("CommentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSuperAdmin.mockReturnValue(false);
  });

  it("shows Delete button for super admin even when not creator or community admin", () => {
    mocks.isSuperAdmin.mockReturnValue(true);

    render(
      <CommentItem
        comment={baseComment}
        onDeleteComment={mocks.onDeleteComment}
        loadingDelete={false}
        userId="super-admin-uid"
        isCommunityAdmin={false}
        onCreateComment={mocks.onCreateComment}
      />,
      { wrapper },
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("hides Delete button for regular user who is not creator or community admin", () => {
    mocks.isSuperAdmin.mockReturnValue(false);

    render(
      <CommentItem
        comment={baseComment}
        onDeleteComment={mocks.onDeleteComment}
        loadingDelete={false}
        userId="other-user"
        isCommunityAdmin={false}
        onCreateComment={mocks.onCreateComment}
      />,
      { wrapper },
    );

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("shows Delete button for comment creator", () => {
    render(
      <CommentItem
        comment={baseComment}
        onDeleteComment={mocks.onDeleteComment}
        loadingDelete={false}
        userId="creator-user"
        isCommunityAdmin={false}
        onCreateComment={mocks.onCreateComment}
      />,
      { wrapper },
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows Delete button for community admin", () => {
    render(
      <CommentItem
        comment={baseComment}
        onDeleteComment={mocks.onDeleteComment}
        loadingDelete={false}
        userId="other-admin"
        isCommunityAdmin={true}
        onCreateComment={mocks.onCreateComment}
      />,
      { wrapper },
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});

