import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

/**
 * Interface representing a post.
 */
export type Post = {
  id?: string; // optional because firebase will automatically add the id for the post
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
 * Snippet representing user voting on a post.
 * This snippet is stored in the `users` collection in Firebase.
 * Stores the ID of the post, ID of the community of that post, and whether it was liked or disliked (+-1)
 */
export type PostVote = {
  id: string;
  postId: string;
  communityId: string;
  voteValue: number;
};

/**
 * Represents the base state for the Recoil atom.
 */
interface PostState {
  selectedPost: Post | null; // when user opens a post
  posts: Post[]; //  all the post
  postVotes: PostVote[];
}

/**
 * Represents the default state of the Recoil atom.
 * Initially, no post is selected, there are no posts and posts have not been voted on.
 * @requires PostState - default state type
 */
const defaultPostState: PostState = {
  selectedPost: null,
  posts: [],
  postVotes: [],
};

/**
 * Atom which describes the recoil state.
 * @requires PostState - type of the state
 * @requires defaultPostState - default state of the atom
 * @see https://recoiljs.org/docs/basic-tutorial/atoms/
 */
export const postState = atom<PostState>({
  key: "postState",
  default: defaultPostState,
});
