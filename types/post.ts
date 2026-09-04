import type { Timestamp } from "firebase/firestore";

/**
 * Shape of a post document stored in Firestore and consumed by the UI.
 * Captures feed fields, vote totals, and optional image metadata.
 * Stored at `posts/{id}` with `createTime` from `serverTimestamp`.
 * @see https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp
 */
export type Post = {
  id?: string;
  communityId: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  body: string;
  numberOfComments: number;
  voteStatus: number;
  imageURL?: string;
  communityImageURL?: string;
  createTime: Timestamp;
};

/**
 * Represents a user's vote record on a post for syncing client and server state.
 * Lives under `users/{uid}/postVotes/{voteId}` to mirror aggregate voteStatus.
 */
export type PostVote = {
  id: string;
  postId: string;
  communityId: string;
  voteValue: number;
};
