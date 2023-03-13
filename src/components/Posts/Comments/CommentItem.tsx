import { Box, Flex, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { CgProfile } from "react-icons/cg";

/**
 * Required props for CommentItem component
 * @param {Comment} comment - comment object
 * @param {onDeleteComment} onDeleteComment - function to handle deleting comment
 * @param {loadingDelete} loadingDelete - is the comment being deleted
 * @param {userId} userId - id of the currently logged in user
 */
type CommentItemProps = {
  comment: Comment;
  onDeleteComment: (comment: Comment) => void;
  loadingDelete: boolean;
  userId?: string;
};

/**
 * Represents a comment object.
 * @property {string} id - id of the comment
 * @property {string} creatorId - id of the user who created the comment
 * @property {string} creatorDisplayText - display text of the user who created the comment
 * @property {string} communityId - id of the community the comment belongs to
 * @property {string} postId - id of the post the comment belongs to
 * @property {string} postTitle - title of the post the comment belongs to
 * @property {string} text - text of the comment
 * @property {Timestamp} createdAt - time the comment was created
 */
export type Comment = {
  id: string;
  creatorId: string;
  creatorDisplayText: string;
  communityId: string;
  postId: string;
  postTitle: string;
  text: string;
  createdAt: Timestamp;
};

/**
 * Renders a comment item.
 * The components displays:
 *  - Comment text
 *  - Creator of the comment
 *  - Time the comment was created
 *  - Delete button if the currently logged in user is the creator of the comment
 *
 * @param {Comment} comment - comment object
 * @param {onDeleteComment} onDeleteComment - function to handle deleting comment
 * @param {loadingDelete} loadingDelete - is the comment being deleted
 * @param {userId} userId - id of the currently logged in user
 *
 * @returns {React.FC<CommentItemProps>} - comment item
 */
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  loadingDelete,
  userId,
}) => {
  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor="gray.300"
      borderRadius={10}
      shadow="sm"
    >
      <Flex m={2}>
        <Box>
          <Icon as={CgProfile} fontSize={30} color="gray.300" mr={2} />
        </Box>
        <Stack spacing={1}>
          <Stack direction="row" align="center" fontSize="8pt">
            <Text fontWeight={600}>{comment.creatorDisplayText}</Text>
            {/* <Text>{createdAtString}</Text> */}
            {loadingDelete && <Spinner size="sm" />}
          </Stack>
          <Text fontSize="10pt">{comment.text}</Text>
          <Stack
            direction="row"
            align="center"
            cursor="pointer"
            color="gray.500"
          >
            {userId === comment.creatorId && (
              <>
                <Text fontSize="10pt" _hover={{ color: "red.500" }}>
                  Edit
                </Text>
                <Text
                  fontSize="10pt"
                  _hover={{ color: "red.500" }}
                  onClick={() => onDeleteComment(comment)}
                >
                  Delete
                </Text>
              </>
            )}
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default CommentItem;
