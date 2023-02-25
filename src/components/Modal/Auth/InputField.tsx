import { Input } from "@chakra-ui/react";

interface InputFieldProps {
  name: string;
  placeholder: string;
  type: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  type,
  onChange,
}) => {
  return (
    <Input
      required
      name={name}
      placeholder={placeholder}
      type={type}
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
  );
};

export default InputField;
