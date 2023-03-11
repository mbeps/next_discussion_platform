import { Button, Flex, Icon, Image, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { BsDot } from "react-icons/bs";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { auth } from "../../../firebase/clientApp";

/**
 * Allows the user to reset their password.
 * Takes the email as the input and sends the user an email from Firebase to reset the password.
 * Once the email is submitted, a new view is shown telling the user to check their email.
 * @returns {React.FC} - Reset Password view in the authentication modal
 *
 * @see https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
 */
const ResetPassword: React.FC = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);

  /**
   * This function is used as the event handler for a form submission.
   * It will prevent the page from refreshing.
   * Sends the email from Firebase to the email that was inputted in the form.
   * @param {React.FormEvent<HTMLFormElement>} event - the submit event triggered by the form
   */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent page from reloading

    await sendPasswordResetEmail(email); // try to send email
    setSuccess(true); // once the email is successfully send
  };
  return (
    <Flex direction="column" alignItems="center" width="100%">
      <Image src="/images/logo.svg" height="40px" mb={2} alt="Website logo" />
      <Text fontWeight={700} mb={2}>
        Reset your password
      </Text>
      {/* Go to next page once the email is successfully sent */}
      {success ? (
        <Text mb={4}>Check your email</Text>
      ) : (
        // While the email has not been sent, show the form
        <>
          <Text fontSize="sm" textAlign="center" mb={2}>
            Enter the email associated with your account and we will send you a
            reset link
          </Text>
          <form onSubmit={onSubmit} style={{ width: "100%" }}>
            <Input
              required
              name="email"
              placeholder="Email"
              type="email"
              mb={2}
              onChange={(event) => setEmail(event.target.value)}
              fontSize="10pt"
              _placeholder={{ color: "gray.500" }}
              _hover={{
                bg: "white",
                border: "1px solid",
                borderColor: "blue.500",
              }}
              _focus={{
                outline: "none",
                bg: "white",
                border: "1px solid",
                borderColor: "blue.500",
              }}
              bg="gray.50"
            />
            <Text textAlign="center" fontSize="10pt" color="red">
              {error?.message}
            </Text>
            <Button
              width="100%"
              height="36px"
              mb={2}
              mt={2}
              type="submit"
              isLoading={sending}
            >
              Reset Password
            </Button>
          </form>
        </>
      )}
      <Flex
        alignItems="center"
        fontSize="9pt"
        color="red.500"
        fontWeight={700}
        cursor="pointer"
      >
        <Text
          onClick={() =>
            setAuthModalState((prev) => ({
              ...prev,
              view: "login",
            }))
          }
        >
          LOGIN
        </Text>
        <Icon as={BsDot} />
        <Text
          onClick={() =>
            setAuthModalState((prev) => ({
              ...prev,
              view: "signup",
            }))
          }
        >
          SIGN UP
        </Text>
      </Flex>
    </Flex>
  );
};
export default ResetPassword;
