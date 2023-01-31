/**
 * Firebase error messages. 
 * The default error messages are not very user friendly hence they are mapped to more user friendly messages.
 * @see https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword
 */
export const FIREBASE_ERRORS = {
	// Sign Up Errors
	"Firebase: Error (auth/email-already-in-use).": "Email already in use.",
	"Firebase: Error (auth/account-exists-with-different-credential).": "Email already in use.",

	// Sign In Errors
	"Firebase: Error (auth/user-not-found).": "Invalid email or password",
  	"Firebase: Error (auth/wrong-password).": "Invalid email or password",
}