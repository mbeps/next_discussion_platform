import { Button, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import InputField from "./InputField";

/**
 * Allows the user to create an account by inputting the required credentials (email and password).
 * There are 2 password fields to ensure that the user inputs the correct password.
 * If the 2 passwords do not match, the account is not created and an error is displayed.
 * If the email already exists, the account is not created and an error is displayed.
 *
 * A button to log in instead is available which would switch the modal to the log in view when clicked.
 * @returns {React.FC} - Sign up components view for modal.
 *
 * @see https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
 */
const SignUp = () => {
  const setAuthModalState = useSetRecoilState(authModalState); // Set global state
  const [signUpForm, setSignUpForm] = useState({
    email: "", // Initially empty email
    password: "", // Initially empty password
    confirmPassword: "", // Initially empty confirm password
  });
  const [error, setError] = useState(""); // Initially empty error
  const [
    createUserWithEmailAndPassword, // returns a function that returns the user, loading or error
    user,
    loading,
    userError,
  ] = useCreateUserWithEmailAndPassword(auth);

  /**
   * This function is used as the event handler for a form submission.
   * It will prevent the page from refreshing.
   * Checks if the password and confirm password fields match and the password requirements are met:
   *  - If they do not match, an error message is set and the function returns without creating a new user.
   *  - If the password does not meet the requirements, an error message is set and the function returns without creating a new user.
   *  - If the passwords match and the password meets the requirements, a new user is created using the email and password provided in the form.
   * @param {React.FormEvent<HTMLFormElement>} event - the submit event triggered by the form
   *
   * @returns exit if there is an error or the passwords do not match
   */
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the page from refreshing
    if (error) setError(""); // If there is an error, clear it
    if (signUpForm.password !== signUpForm.confirmPassword) {
      // If the password and confirm password don't match
      setError("Passwords don't match"); // Set error
      return; // Return so that the function doesn't continue
    }
    if (signUpForm.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/\d/.test(signUpForm.password)) {
      setError("Password must contain at least 1 number");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(signUpForm.password)) {
      setError("Password must contain at least 1 special character");
      return;
    }
    if (!/[A-Z]/.test(signUpForm.password)) {
      setError("Password must contain at least 1 capital letter");
      return;
    }

    createUserWithEmailAndPassword(signUpForm.email, signUpForm.password); // Create user with email and password
  }; // Function to execute when the form is submitted

  /**
   * Function to execute when the form is changed (when email and password are typed).
   * Multiple inputs use the same onChange function.
   * @param {React.ChangeEvent<HTMLInputElement>} event - the change event triggered by the input
   */
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update form state
    setSignUpForm((prev) => ({
      ...prev, // Spread previous state because we don't want to lose the other input's value
      [event.target.name]: event.target.value, // Catch the name of the input that was changed and update the corresponding state
    }));
  };

  const isButtonDisabled = () => {
    return (
      !signUpForm.email || !signUpForm.password || !signUpForm.confirmPassword
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

      <InputField
        name="confirmPassword"
        placeholder="Confirm Password"
        type="password"
        onChange={onChange}
      />

      {/* If there is error than the error is shown */}

      <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">
        {error ||
          FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]}
      </Text>

      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="submit"
        isLoading={loading} // If loading (from Firebase) is true, show loading spinner
        isDisabled={isButtonDisabled()}
      >
        {" "}
        {/* When the form is submitted, execute onSubmit function */}
        Sign Up
      </Button>

      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Already a Clown? </Text>
        <Text
          color="red.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModalState((prev) => ({
              ...prev,
              view: "login",
            }))
          }
        >
          Log In
        </Text>
      </Flex>
    </form>
  );
};

export default SignUp;
