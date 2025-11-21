import { atom } from "jotai";

/**
 * Interface which describes the state of the authentication modal.
 * The modal has 2 properties:
 * @property {boolean} open - whether the modal is open or not
 * @property {"login" | "signup" | "resetPassword"} view - which specific view of the modal should be displayed
 *
 * @see https://jotai.org/docs/core/atom
 */
export interface AuthModalState {
  open: boolean;
  view: "login" | "signup" | "resetPassword";
}

/**
 * Describes the default state of the authentication modal.
 * By default, the modal is closed and
 * if no state is specified, it will open in the log in view.
 * @property {boolean} open - modal is closed by default
 * @property {"login"} view - log in view is displayed by default
 */
const defaultModalState: AuthModalState = {
  open: false,
  view: "login",
};

/**
 * Atom which describes the state of the authentication modal.
 *
 * @requires AuthModalState - state definition
 * @requires defaultModalState - default state
 *
 * @see https://jotai.org/docs/core/atom
 */
export const authModalStateAtom = atom<AuthModalState>(defaultModalState);
