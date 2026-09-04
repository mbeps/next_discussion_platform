import { atom } from "jotai";
import type { Community, CommunitySnippet } from "@/types/community";

/**
 * Stores the community snippets to track the state of the communities atom.
 * @propertymySnippets - list of community snippets
 * @property currentCommunity - the community the user is currently in
 * @property snippetFetched - whether the community snippets have been fetched or not
 */
interface CommunityState {
  mySnippets: CommunitySnippet[];
  currentCommunity?: Community;
  snippetFetched: boolean;
}

/**
 * Initially, the array for the community state is empty.
 * The community snippets have not been fetched initially hence array is empty.
 * @property mySnippets - empty array
 * @property snippetFetched - false by default
 */
export const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetFetched: false,
};

/**
 * A Jotai atom that manages the community-related state for the application.
 * It stores the user's community membership snippets, the currently active community,
 * and a flag indicating whether the snippets have been successfully fetched.
 */
export const communityStateAtom = atom<CommunityState>(defaultCommunityState);
