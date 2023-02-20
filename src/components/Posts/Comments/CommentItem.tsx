import { Box, Flex, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { CgProfile } from "react-icons/cg";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";

type CommentItemProps = {
  comment: Comment;
  onDeleteComment: (comment: Comment) => void;
  loadingDelete: boolean;
  userId: string;
};

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

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  loadingDelete,
  userId,
}) => {
  return (
    <Flex outline="1px solid" borderColor="gray.300" borderRadius={10}>
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
            <Icon as={IoArrowUpCircleOutline} fontSize="16pt" />
            <Icon as={IoArrowDownCircleOutline} fontSize="16pt" />
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
