import { Input, type InputProps } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Input field for various forms used in the Auth modal component.
 */
const InputField = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      mb={2}
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
    />
  );
});

InputField.displayName = "InputField";

export default InputField;
