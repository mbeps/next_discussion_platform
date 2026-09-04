import { Button, Flex, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import { PasswordInput } from "@/components/ui/password-input";
import { type SignUpInput, signUpSchema } from "@/schema/auth";
import { authModalStateAtom } from "../../../atoms/authModalAtom";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import InputField from "./InputField";

const SignUp = () => {
  const setAuthModalState = useSetAtom(authModalStateAtom);
  const [createUserWithEmailAndPassword, _user, loading, userError] =
    useCreateUserWithEmailAndPassword(auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = (data: SignUpInput) => {
    createUserWithEmailAndPassword(data.email, data.password);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      style={{ width: "100%" }}
    >
      <InputField placeholder="Email" type="email" {...register("email")} />
      {errors.email && (
        <Text color="red.500" fontSize="10pt" mt={1}>
          {errors.email.message}
        </Text>
      )}

      <PasswordInput
        placeholder="Password"
        rootProps={{ mb: 2, mt: 2 }}
        fontSize="10pt"
        bg={{ base: "gray.50", _dark: "gray.800" }}
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        _focus={{
          outline: "none",
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        {...register("password")}
      />
      {errors.password && (
        <Text color="red.500" fontSize="10pt" mt={1}>
          {errors.password.message}
        </Text>
      )}

      <PasswordInput
        placeholder="Confirm Password"
        rootProps={{ mb: 2, mt: 2 }}
        fontSize="10pt"
        bg={{ base: "gray.50", _dark: "gray.800" }}
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        _focus={{
          outline: "none",
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        {...register("confirmPassword")}
      />
      {errors.confirmPassword && (
        <Text color="red.500" fontSize="10pt" mt={1}>
          {errors.confirmPassword.message}
        </Text>
      )}

      <Text
        textAlign="center"
        color={{ base: "red.500", _dark: "red.400" }}
        fontSize="10pt"
        fontWeight="800"
        mt={2}
      >
        {userError &&
          (FIREBASE_ERRORS[userError.code as keyof typeof FIREBASE_ERRORS] ||
            userError.message)}
      </Text>

      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="button"
        onClick={handleSubmit(onSubmit)}
        loading={loading}
        disabled={!isValid}
      >
        Sign Up
      </Button>

      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Already a Clown? </Text>
        <Text
          color={{ base: "red.500", _dark: "red.400" }}
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
