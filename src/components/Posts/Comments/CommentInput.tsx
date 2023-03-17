import ProfileModal from "@/components/Modal/Profile/ProfileModal";
import AuthButtons from "@/components/Navbar/RightContent/AuthButtons";
import { Flex, Textarea, Button, Text, Stack } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React, { useState } from "react";

/**
 * Required props for CommentInput component
 * @param {string} commentText - text of the comment
 * @param {setCommentText} setCommentText - function to set the comment text
 * @param {User} user - User object from firebase
 * @param {boolean} createLoading - is the comment being created
 * @param {onCreateComment} onCreateComment - function to handle creating comment
 */
type CommentInputProps = {
  commentText: string;
  setCommentText: (value: string) => void;
  user?: User | null;
  createLoading: boolean;
  onCreateComment: (commentText: string) => void;
};

/**
 * Input box for creating a comment by inputting text.
 * The component displays:
 *  - Textarea for inputting comment text
 *  - Button for creating the comment
 *
 * If the user is not logged in, the component displays:
 *  - Text prompting the user to log in or sign up
 *  - AuthButtons component
 *
 * @param {string} commentText - text of the comment
 * @param {setCommentText} setCommentText - function to set the comment text
 * @param {User} user - User object from firebase
 * @param {boolean} createLoading - is the comment being created
 * @param {onCreateComment} onCreateComment - function to handle creating comment
 *
 * @returns {React.FC<CommentInputProps>} - input box for creating a comment
 */
const CommentInput: React.FC<CommentInputProps> = ({
  commentText,
  setCommentText,
  user,
  createLoading,
  onCreateComment,
}) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  return (
    <Flex direction="column" position="relative">
      {user ? (
        // If the user is logged in, display the comment input box
        <>
          <ProfileModal
            handleClose={() => setProfileModalOpen(false)}
            open={isProfileModalOpen}
          />
          <Stack direction="row" align="center" spacing={1} mb={2}>
            <Text color="gray.600">Comment as</Text>
            <Text
              color="gray.600"
              fontSize="10pt"
              _hover={{
                cursor: "pointer",
                textDecoration: "underline",
                textColor: "red.500",
              }}
              onClick={() => setProfileModalOpen(true)}
            >
              {user?.email?.split("@")[0]}
            </Text>
          </Stack>

          <Textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Comment"
            fontSize="10pt"
            borderRadius={10}
            minHeight="140px"
            padding={4}
            pb={10}
            _placeholder={{ color: "gray.500" }}
            _focus={{
              outline: "none",
              bg: "white",
              border: "1px solid red",
            }}
          />

          <Flex
            position="absolute"
            left="1px"
            right={0.1}
            bottom="1px"
            justify="flex-end"
            bg="gray.100"
            p="6px 8px"
            borderRadius="0px 0px 10px 10px"
            zIndex="997"
          >
            <Button
              height="30px"
              disabled={!commentText.length}
              isLoading={createLoading}
              onClick={() => onCreateComment(commentText)}
              zIndex="999"
            >
              Comment
            </Button>
          </Flex>
        </>
      ) : (
        // If the user is not logged in, display the login/signup prompt
        <Flex
          align="center"
          justify="space-between"
          borderRadius={2}
          border="1px solid"
          borderColor="gray.100"
          p={4}
        >
          <Text fontWeight={600}>Log in or sign up to comment</Text>
          <AuthButtons />
        </Flex>
      )}
    </Flex>
  );
};
export default CommentInput;
