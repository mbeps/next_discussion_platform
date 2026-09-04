import { Box, Input, type InputProps, Text } from "@chakra-ui/react";
import type React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface CommunityNameSectionProps extends InputProps {
  charRemaining?: number;
  error?: string;
  register?: UseFormRegisterReturn;
}

/**
 * Input block for community name entry with character counter and errors.
 * @param charRemaining - Remaining characters allowed.
 * @param error - Validation error message to display.
 * @param register - React Hook Form register object.
 * @returns Form section for naming a community.
 */
const CommunityNameSection: React.FC<CommunityNameSectionProps> = ({
  charRemaining,
  error,
  register,
  ...rest
}) => {
  return (
    <Box>
      <Text fontWeight={600} fontSize={15}>
        Name
      </Text>
      <Text fontSize={11} color="gray.500">
        Community names cannot be changed
      </Text>
      <Input
        mt={2}
        placeholder="Community Name"
        fontSize="10pt"
        borderRadius={"xl"}
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
        {...register}
        {...rest}
      />
      <Text
        fontSize="9pt"
        color={charRemaining === 0 ? "red" : "gray.500"}
        pt={2}
      >
        {charRemaining} Characters remaining
      </Text>
      <Text fontSize="9pt" color="red" pt={1}>
        {error}
      </Text>
    </Box>
  );
};

export default CommunityNameSection;
