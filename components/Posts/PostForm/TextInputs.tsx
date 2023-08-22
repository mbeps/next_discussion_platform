import { Button, Flex, Input, Stack, Textarea } from "@chakra-ui/react";
import React from "react";

/**
 * @param {object} textInputs - object containing title and body of the post
 * @param {event} onChange - function to handle change in the input fields
 * @param {handleCreatePost} handleCreatePost - function to handle creating post
 * @param {boolean} loading - is the post being created
 */
type TextInputsProps = {
  textInputs: {
    title: string;
    body: string;
  };
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCreatePost: () => void;
  loading: boolean;
};

/**
 * Sub-component of `NewPostForm` component.
 * Allows user to enter the title and body of the post.
 * @param {object} textInputs - object containing title and body of the post
 * @param {event} onChange - function to handle change in the input fields
 * @param {handleCreatePost} handleCreatePost - function to handle creating post
 * @param {boolean} loading - is the post being created
 *
 * @returns {React.FC<TextInputsProps>} - input fields for title and body of the post
 */
const TextInputs: React.FC<TextInputsProps> = ({
  textInputs,
  onChange,
  handleCreatePost,
  loading,
}) => {
  return (
    <Stack spacing={3} width="100%">
      {/* Title  of the post*/}
      <Input
        name="title"
        placeholder="Title"
        value={textInputs.title}
        onChange={onChange}
        fontSize="10pt"
        borderRadius={10}
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "red.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "red.500",
        }}
      />
      {/* Body of the post */}
      <Textarea
        name="body"
        placeholder="Text (Optional)"
        value={textInputs.body}
        onChange={onChange}
        fontSize="10pt"
        height="120px"
        borderRadius={10}
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "red.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "red.500",
        }}
      />
      <Flex justify="flex-end">
        {/* Button for creating a new post */}
        <Button
          height="34px"
          padding="0px 30px"
          isDisabled={!textInputs.title} // if there is no text in the title field button is disabled
          isLoading={loading}
          onClick={handleCreatePost}
          shadow="md"
        >
          Post
        </Button>
      </Flex>
    </Stack>
  );
};
export default TextInputs;
