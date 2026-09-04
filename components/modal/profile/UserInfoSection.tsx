import { Flex, Input, Text } from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { EditProfileInput } from "@/schema/profile";

type UserInfoSectionProps = {
  user: User | null | undefined;
  isEditing: boolean;
  register: UseFormRegister<EditProfileInput>;
  errors: FieldErrors<EditProfileInput>;
};

/**
 * Profile info block that toggles between read-only and editable username.
 * @param user - Firebase user for email and current display name.
 * @param isEditing - Whether to show the input.
 * @param register - React Hook Form register function.
 * @param errors - React Hook Form errors object.
 * @returns Email and name display with optional edit input.
 */
const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  user,
  isEditing,
  register,
  errors,
}) => {
  return (
    <>
      {!isEditing && (
        <Flex direction="column">
          <Flex direction="row">
            <Text
              fontSize="12pt"
              color={{ base: "gray.600", _dark: "gray.400" }}
              mr={1}
              fontWeight={600}
            >
              Email:
            </Text>
            <Text fontSize="12pt">{user?.email}</Text>
          </Flex>
          <Flex direction="row">
            <Text
              fontSize="12pt"
              color={{ base: "gray.600", _dark: "gray.400" }}
              mr={1}
              fontWeight={600}
            >
              User Name:
            </Text>
            <Text fontSize="12pt">{user?.displayName || ""}</Text>
          </Flex>
        </Flex>
      )}
      {isEditing && (
        <Flex direction="column" width="100%">
          <Text
            fontSize="sm"
            color={{ base: "gray.500", _dark: "gray.400" }}
            mb={1}
          >
            User Name
          </Text>
          <Input
            placeholder="User Name"
            type="text"
            mb={2}
            fontSize="10pt"
            _placeholder={{ color: "gray.500" }}
            _hover={{
              bg: { base: "white", _dark: "gray.700" },
              border: "1px solid",
              borderColor: "blue.500",
            }}
            _focus={{
              outline: "none",
              bg: { base: "white", _dark: "gray.700" },
              border: "1px solid",
              borderColor: "blue.500",
            }}
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderRadius={10}
            {...register("displayName")}
          />
          {errors.displayName && (
            <Text color="red.500" fontSize="10pt">
              {errors.displayName.message}
            </Text>
          )}
        </Flex>
      )}
    </>
  );
};

export default UserInfoSection;
