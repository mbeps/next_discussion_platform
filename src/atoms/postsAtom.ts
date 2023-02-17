import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export type Post = {
  id?: string; // optional because firebase will automatically add the id for the post
  communityId: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  body: string;
  numberOfComments: number;
  votes: number;
  imageURL?: string;
  communityImageURL?: string;
  createTime: Timestamp;
};

interface PostState {
  selectedPost: Post | null; // when user opens a post
  posts: Post[]; //  all the post
  // postVote
}

const defaultPostState: PostState = {
  selectedPost: null,
  posts: [],
};

export const postState = atom<PostState>({
  key: "postState",
  default: defaultPostState,
});
