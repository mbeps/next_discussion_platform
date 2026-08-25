/// <reference types="vitest" />
import { Timestamp } from "firebase/firestore";
import { Comment } from "@/types/comment";
import { Community, CommunitySnippet } from "@/types/community";
import { Post, PostVote } from "@/types/post";
import { SavedPost } from "@/types/savedPost";

export const TS = Timestamp.fromDate(new Date("2026-01-01"));

export function Post(over: Partial<Post> = {}): Post {
  return {
    id: "p1",
    communityId: "c1",
    creatorId: "creator",
    creatorUsername: "creator",
    title: "Hello",
    body: "World",
    numberOfComments: 0,
    voteStatus: 0,
    createTime: TS,
    ...over,
  };
}

export function Vote(over: Partial<PostVote> = {}): PostVote {
  return {
    id: "v1",
    postId: "p1",
    communityId: "c1",
    voteValue: 1,
    ...over,
  };
}

export function CommunityFixture(over: Partial<Community> = {}): Community {
  return {
    id: "c1",
    creatorId: "creator",
    numberOfMembers: 5,
    privacyType: "public",
    ...over,
  };
}

export function Snippet(
  over: Partial<CommunitySnippet> = {},
): CommunitySnippet {
  return { communityId: "c1", ...over };
}

export function CommentFixture(over: Partial<Comment> = {}): Comment {
  return {
    id: "cm1",
    creatorId: "u1",
    creatorDisplayText: "user",
    communityId: "c1",
    postId: "p1",
    postTitle: "Hello",
    text: "hi",
    createdAt: TS,
    depth: 0,
    ...over,
  };
}

export function SavedPostFixture(over: Partial<SavedPost> = {}): SavedPost {
  return {
    id: "s1",
    postId: "p1",
    communityId: "c1",
    postTitle: "Hello",
    ...over,
  };
}
