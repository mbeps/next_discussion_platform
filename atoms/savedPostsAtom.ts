import { atom } from "jotai";
import type { SavedPost } from "@/types/savedPost";

interface SavedPostState {
  savedPosts: SavedPost[];
  isOpen: boolean;
  fetched: boolean;
}

const defaultSavedPostState: SavedPostState = {
  savedPosts: [],
  isOpen: false,
  fetched: false,
};

/**
 * A Jotai atom that manages the state of the user's saved posts.
 * It tracks the list of saved posts, whether the saved posts modal is open,
 * and whether the saved posts have been fetched from the backend.
 */
export const savedPostStateAtom = atom<SavedPostState>(defaultSavedPostState);
