import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import InputField from "./InputField";

type LoginProps = {};

/**
 * Allows the user to input the log in credentials (email and password) to log into the site.
 * Contains 2 input fields, `Email` and `Password` and a log in button.
 *
 * If the credentials are correct, the user is signed in.
 * If the credentials are incorrect, error messages are displayed.
 *
 * Buttons for resetting the password and signing up are present.
 * Clicking these buttons would change the modal to the appropriate view.
 * @returns {React.FC} - Login component
 *
 * @see https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
 */
const Login: React.FC<LoginProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState); // Set global state
  const [loginForm, setLoginForm] = useState({
    email: "", // Initially empty email
    password: "", // Initially empty password
  });

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  /**
   * This function is used as the event handler for a form submission.
   * It will prevent the page from refreshing.
   * Automatically checks if the user with the email exists and if the password is correct.
   * @param {React.FormEvent<HTMLFormElement>} event - the submit event triggered by the form
   */
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent page from reloading

    signInWithEmailAndPassword(loginForm.email, loginForm.password); // Sign in with email and password
  }; // Function to execute when the form is submitted

  /**
   * Function to execute when the form is changed (when email and password are typed).
   * Multiple inputs use the same `onChange` function.
   * @param event (React.ChangeEvent<HTMLInputElement>) - the event that is triggered when the form is changed
   */
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update form state
    setLoginForm((prev) => ({
      ...prev, // Spread previous state because we don't want to lose the other input's value
      [event.target.name]: event.target.value, // Catch the name of the input that was changed and update the corresponding state
    }));
  };

  /**
   * Determines whether the button is disabled or not.
   * The button is disabled if the email or password is empty.
   * @returns {boolean} - Whether the button is disabled or not
   */
  const isButtonDisabled = () => {
    return (
      !loginForm.email || !loginForm.password
      // signUpForm.confirmPassword !== signUpForm.password
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <InputField
        name="email"
        placeholder="Email"
        type="email"
        onChange={onChange}
      />

      <InputField
        name="password"
        placeholder="Password"
        type="password"
        onChange={onChange}
      />

      <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">
        {FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}
      </Text>

      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="submit"
        isLoading={loading}
        isDisabled={isButtonDisabled()}
      >
        {" "}
        {/* When the form is submitted, execute onSubmit function */}
        Log In
      </Button>

      <Flex fontSize="9pt" justifyContent="center" mb={2}>
        <Text fontSize="9pt" mr={1}>
          Forgot your password?
        </Text>
        <Text
          color="red.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModalState((prev) => ({
              ...prev,
              view: "resetPassword",
            }))
          }
        >
          Reset Password
        </Text>
      </Flex>

      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Want to join the circus? </Text>
        <Text
          color="red.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModalState((prev) => ({
              ...prev,
              view: "signup",
            }))
          }
        >
          Sign Up
        </Text>
      </Flex>
    </form>
  );
};

export default Login;
