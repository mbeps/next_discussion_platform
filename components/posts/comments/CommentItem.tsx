import {
  Box,
  Button,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { LuPencil, LuReply, LuTrash } from "react-icons/lu";
import ConfirmationDialog from "@/components/modal/ConfirmationDialog";
import type { Comment } from "@/types/comment";
import CommentInput from "./CommentInput";

/**
 * Props for the CommentItem component.
 * @param comment - The comment data to display.
 * @param onDeleteComment - Callback to handle comment deletion.
 * @param loadingDelete - Indicates if the comment is currently being deleted.
 * @param userId - ID of the currently logged-in user.
 * @param isCommunityAdmin - Whether the current user is an admin of the community.
 * @param onCreateComment - Callback to create a new reply.
 * @param user - The currently authenticated user.
 * @param canComment - Whether the user has permission to comment in this community.
 */
type CommentItemProps = {
  comment: Comment;
  onDeleteComment: (comment: Comment) => void;
  loadingDelete: boolean;
  userId?: string;
  isCommunityAdmin?: boolean;
  onCreateComment: (
    user: User,
    text: string,
    parentId: string,
    depth: number,
  ) => Promise<void>;
  user?: User;
  canComment?: boolean;
};

/**
 * Renders an individual comment with its metadata and action buttons.
 * Displays the comment text, creator, and timestamp, along with options to reply or delete.
 * @param props - Component properties.
 * @returns A themed flex container representing the comment.
 */
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  loadingDelete,
  userId,
  isCommunityAdmin,
  onCreateComment,
  user,
  canComment = true,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleReply = async (text: string) => {
    if (!user) return;
    setReplyLoading(true);
    await onCreateComment(user, text, comment.id, (comment.depth || 0) + 1);
    setReplyLoading(false);
    setIsReplying(false);
  };

  return (
    <Flex
      direction="column"
      border="1px solid"
      bg={{ base: "white", _dark: "gray.800" }}
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      borderRadius={10}
      width="100%"
      overflow="hidden"
    >
      <Flex p={3} pb={2}>
        <Box>
          <Icon as={CgProfile} fontSize={30} color="gray.300" mr={2} />
        </Box>
        <Stack gap={1} width="100%">
          <Stack direction="row" align="center" fontSize="8pt">
            <Text fontWeight={700}>{comment.creatorDisplayText}</Text>
            {loadingDelete && <Spinner size="sm" />}
          </Stack>
          <Text fontSize="11pt">{comment.text}</Text>
        </Stack>
      </Flex>

      <Flex
        bg={{ base: "gray.50", _dark: "gray.700" }}
        p={2}
        align="center"
        borderTop="1px solid"
        borderColor={{ base: "gray.100", _dark: "gray.600" }}
      >
        <Stack direction="row" align="center" gap={2}>
          {(comment.depth || 0) < 2 && canComment && (
            <Button
              size="sm"
              variant="ghost"
              fontSize="10pt"
              fontWeight={600}
              color={{ base: "gray.500", _dark: "gray.400" }}
              _hover={{
                color: { base: "blue.500", _dark: "blue.400" },
                bg: "transparent",
              }}
              onClick={() => setIsReplying(!isReplying)}
            >
              <Icon as={LuReply} mr={2} />
              Reply
            </Button>
          )}
          {userId === comment.creatorId && (
            <Button
              size="sm"
              variant="ghost"
              fontSize="10pt"
              fontWeight={600}
              color={{ base: "gray.500", _dark: "gray.400" }}
              _hover={{
                color: { base: "blue.500", _dark: "blue.400" },
                bg: "transparent",
              }}
            >
              <Icon as={LuPencil} mr={2} />
              Edit
            </Button>
          )}
          {(userId === comment.creatorId || isCommunityAdmin) && (
            <Button
              size="sm"
              variant="ghost"
              fontSize="10pt"
              fontWeight={600}
              color={{ base: "gray.500", _dark: "gray.400" }}
              _hover={{
                color: { base: "red.500", _dark: "red.400" },
                bg: "transparent",
              }}
              onClick={() => setDeleteConfirmationOpen(true)}
            >
              <Icon as={LuTrash} mr={2} />
              Delete
            </Button>
          )}
        </Stack>
      </Flex>

      {isReplying && (
        <Box
          p={2}
          pl={12}
          bg={{ base: "gray.50", _dark: "gray.700" }}
          borderTop="1px solid"
          borderColor={{ base: "gray.100", _dark: "gray.600" }}
        >
          <CommentInput
            user={user}
            createLoading={replyLoading}
            onCreateComment={handleReply}
          />
        </Box>
      )}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => {
          onDeleteComment(comment);
          setDeleteConfirmationOpen(false);
        }}
        title="Delete Comment"
        body="Are you sure you want to delete this comment? This action cannot be undone."
        confirmButtonText="Delete"
        isLoading={loadingDelete}
      />
    </Flex>
  );
};
export default CommentItem;
