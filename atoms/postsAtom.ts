import { atom } from "jotai";
import type { Post, PostVote } from "@/types/post";

/**
 * Represents the base state for the atom.
 * @property selectedPost - the post that is currently selected
 * @property posts - all the posts
 * @property postVotes - all the post votes
 */
interface PostState {
  selectedPost: Post | null;
  posts: Post[];
  postVotes: PostVote[];
}

/**
 * Represents the default state of the atom.
 * Initially:
 *  - No post is selected
 *  - There are no posts to be displayed
 *  - Posts have not been voted on by the current user
 * @property selectedPost - null as no post is selected
 * @property posts - empty array as there are no posts
 * @property postVotes - empty array as posts have not been voted on
 *
 * @requires PostState - default state type
 */
const defaultPostState: PostState = {
  selectedPost: null,
  posts: [],
  postVotes: [],
};

/**
 * A Jotai atom that manages the post-related state for the application.
 * It stores the currently selected post, the list of posts being displayed,
 * and the user's voting history for those posts.
 */
export const postStateAtom = atom<PostState>(defaultPostState);
