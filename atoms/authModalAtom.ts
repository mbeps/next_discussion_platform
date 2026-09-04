import { atom } from "jotai";
import type { AuthModalState } from "@/types/authModal";

/**
 * Describes the default state of the authentication modal.
 * By default, the modal is closed and
 * if no state is specified, it will open in the log in view.
 * @property open - modal is closed by default
 * @property view - log in view is displayed by default
 */
const defaultModalState: AuthModalState = {
  open: false,
  view: "login",
};

/**
 * A Jotai atom that manages the state of the authentication modal.
 * It tracks whether the modal is open and which view (login, signup, or reset password) is currently active.
 */
export const authModalStateAtom = atom<AuthModalState>(defaultModalState);
