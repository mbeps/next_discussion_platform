import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

/**
 * Interface representing a community. 
 * Community:   id: string;
      - `creatorId`: string;
      - `numberOfMembers`: number;
      - `privacyType`: "public" | "restricted" | "private";
      - `createdAt`: Timestamp;
      - `imageURL`: string;
 */
export interface Community {
  id: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "restricted" | "private";
  createdAt?: Timestamp;
  imageURL?: string;
}

/**
 * The communities a user us subscribed to is stored in the `users` collection (as snippets)
 * in the database for higher efficiency.
 * This interface represents the snippets of data for a community that a user is subscribed to.
 */
export interface CommunitySnippet {
  communityId: string;
  isAdmin?: boolean;
  imageURL?: string;
}

/**
 * Stores the community snippets to track the state of the communities atom.
 */
interface CommunityState {
  mySnippets: CommunitySnippet[]; // stores a list of community snippets
  currentCommunity?: Community; // user is not always in a community hence optional
}

/**
 * Initially, the array for the community state is empty.
 */
const defaultCommunityState: CommunityState = {
  mySnippets: [],
};

/**
 * Atom which describes the state of the community state.
 * @requires CommunityState - state definition
 * @requires defaultCommunityState - default state
 * @see https://recoiljs.org/docs/basic-tutorial/atoms/
 */
export const communityState = atom<CommunityState>({
  key: "communityState",
  default: defaultCommunityState,
});
