import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

/**
 * Interface representing a community.
 * @property {string} id - unique identifier for the community
 * @property {string} creatorId - unique identifier for the user who created the community
 * @property {number} numberOfMembers - number of members in the community
 * @property {"public" | "restricted" | "private"} privacyType - privacy type of the community
 * @property {Timestamp} createdAt - timestamp of when the community was created
 * @property {string} imageURL - URL of the community's image
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
 * The snippet representing a community a user us subscribed to
 * is stored in the `users` collection (as snippets) in the database for higher efficiency.
 * This interface represents the snippets of data for a community that a user is subscribed to.
 * The whole community data is not required and it can be fetched from `communities` if required.
 * This stores just enough data to model the subscription relations.
 * @property {string} communityId - unique identifier for the community
 * @property {boolean} isAdmin - whether the user is an admin of the community or not
 * @property {string} imageURL - URL of the community's image
 */
export interface CommunitySnippet {
  communityId: string;
  isAdmin?: boolean;
  imageURL?: string;
}

/**
 * Stores the community snippets to track the state of the communities atom.
 * @property {CommunitySnippet[]} mySnippets - list of community snippets
 * @property {Community} currentCommunity - the community the user is currently in
 * @property {boolean} snippetFetched - whether the community snippets have been fetched or not
 */
interface CommunityState {
  mySnippets: CommunitySnippet[]; // stores a list of community snippets
  currentCommunity?: Community; // user is not always in a community hence optional
  snippetFetched: boolean;
}

/**
 * Initially, the array for the community state is empty.
 * The community snippets have not been fetched initially hence array is empty.
 * @property {CommunitySnippet[]} mySnippets - empty array
 * @property {boolean} snippetFetched - false by default
 */
const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetFetched: false,
};

/**
 * Atom which describes the state of the community state.
 * @property {CommunityState} key - unique identifier for the atom
 * @property {CommunityState} default - default state of the atom for tracking community state
 *
 * @requires CommunityState - state definition
 * @requires defaultCommunityState - default state
 *
 * @see https://recoiljs.org/docs/basic-tutorial/atoms/
 */
export const communityState = atom<CommunityState>({
  key: "communityState",
  default: defaultCommunityState,
});
