/**
 * Firebase error messages.
 * The default error messages are not very user friendly hence they are mapped to more user friendly messages.
 * @see https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword
 */
export const FIREBASE_ERRORS = {
  // Sign Up Errors
  "auth/email-already-in-use": "Email already in use.",
  "auth/account-exists-with-different-credential": "Email already in use.",

  // Sign In Errors
  "auth/user-not-found": "Invalid email or password",
  "auth/wrong-password": "Invalid email or password",
  "auth/invalid-credential": "Invalid email or password",
};
