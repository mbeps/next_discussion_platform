import type { Timestamp } from "firebase/firestore";

/**
 * Firestore community document used to render pages and determine permissions.
 * Tracks ownership, privacy, member count, optional branding, and admin ids.
 * Stored at `communities/{id}`; snippets mirror membership per user.
 */
export interface Community {
  id: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "restricted" | "private";
  createdAt?: Timestamp;
  imageURL?: string;
  adminIds?: string[];
}

/**
 * Lightweight user-scoped record that links a user to a community.
 * Stored under `users/{uid}/communitySnippets/{communityId}` for menus and permissions.
 */
export interface CommunitySnippet {
  communityId: string;
  isAdmin?: boolean;
  imageURL?: string;
}
