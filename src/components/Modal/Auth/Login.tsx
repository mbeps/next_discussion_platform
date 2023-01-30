import { authModalState } from "@/atoms/authModalAtom";
import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
	const [loginForm, setLoginForm] = useState({
    email: "", // Initially empty email
    password: "", // Initially empty password
  });

  const onSubmit = () => {};

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <form>
      <Input
        required
        name="email"
        placeholder="Email"
        type="email"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        bg="gray.50"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          borderColor: "red.400",
          border: "1px solid",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          borderColor: "gray.500",
          border: "1px solid",
        }}
      />
      <Input
        required
        name="password"
        placeholder="Password"
        type="password"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        bg="gray.50"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          borderColor: "red.400",
          border: "1px solid",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          borderColor: "gray.500",
          border: "1px solid",
        }}
      />
      <Button width="100%" height="36px" mt={2} mb={2} type="submit">
        Log In
      </Button>

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
