import { atom } from "recoil";

/**
 * Interface which describes the state of the authentication modal.
 * The modal has 2 properties:
 *
 * 	- `open` (boolean): whether it is open or not
 * 	- `view` ("login" | "signup" | "resetPassword"): which specific view of the modal should be displayed
 */
export interface AuthModalState {
  open: boolean;
  view: "login" | "signup" | "resetPassword";
}

/**
 * Describes the default state of the authentication modal.
 * By default, the modal is closed and 
 * if no state is specified, it will open in the log in view.  
 */
const defaultModalState: AuthModalState = {
  open: false,
  view: "login",
};

/**
 * Atom which describes the state of the authentication modal. 
 * The atom has the state options defined by `AuthModalState` and 
 * uses the default state defined in `AuthModalState`. 
 * @requires AuthModalState
 * @requires defaultModalState
 * @see https://recoiljs.org/docs/basic-tutorial/atoms/
 */
export const authModalState = atom<AuthModalState>({
  key: "authModalState", // unique identifier for the atom
  default: defaultModalState,
});
