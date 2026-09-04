import {
  Box,
  createTreeCollection,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  TreeView,
} from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import { useMemo } from "react";
import { LuChevronRight } from "react-icons/lu";
import useCommentList from "@/hooks/comments/useCommentList";
import useCreateComment from "@/hooks/comments/useCreateComment";
import useDeleteComment from "@/hooks/comments/useDeleteComment";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import useCommunityState from "@/hooks/community/useCommunityState";
import type { Comment } from "@/types/comment";
import type { Post } from "@/types/post";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

type CommentsProps = {
  user?: User;
  selectedPost: Post | null;
  communityId: string;
  isCommunityAdmin?: boolean;
};

/**
 * Shows a post's comments with threaded replies and CRUD controls.
 * @param user - Authenticated user creating or deleting comments.
 * @param selectedPost - Post whose comments are displayed.
 * @param communityId - Community id used for permissions.
 * @param isCommunityAdmin - Whether the viewer can moderate comments.
 * @returns Comment tree with input and loading states.
 */
const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId: _communityId,
  isCommunityAdmin,
}) => {
  const { comments, setComments, commentFetchLoading } =
    useCommentList(selectedPost);
  const { createComment, createLoading } = useCreateComment(
    selectedPost,
    setComments,
  );
  const { deleteComment, deleteLoadingId } = useDeleteComment(
    comments,
    setComments,
  );
  const { communityStateValue } = useCommunityState();
  const { canComment } = useCommunityPermissions(
    communityStateValue.currentCommunity,
  );

  const handleCreateComment = async (text: string) => {
    await createComment(user!, text);
  };

  const collection = useMemo(() => {
    interface CommentNode extends Comment {
      children: CommentNode[];
    }

    const commentMap = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // Deep copy and initialize children
    const nodes = comments.map((c) => ({
      ...c,
      children: [],
    })) as CommentNode[];

    nodes.forEach((node) => {
      commentMap.set(node.id, node);
    });

    nodes.forEach((node) => {
      if (node.parentId && commentMap.has(node.parentId)) {
        commentMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return createTreeCollection<CommentNode>({
      nodeToValue: (node: any) => node.id,
      nodeToString: (node: any) => node.text,
      rootNode: {
        id: "ROOT",
        children: roots,
      } as unknown as CommentNode,
    });
  }, [comments]);

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.800" }}
      borderRadius={10}
      pt={4}
      shadow="md"
    >
      <Flex
        direction="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        {canComment && (
          <CommentInput
            user={user}
            createLoading={createLoading}
            onCreateComment={handleCreateComment}
          />
        )}
      </Flex>
      <Stack gap={4} m={4} ml={10}>
        {commentFetchLoading ? (
          [0, 1, 2, 3].map((item) => (
            <Box
              key={item}
              padding="6"
              bg={{ base: "white", _dark: "gray.800" }}
            >
              <SkeletonCircle size="10" />
              <SkeletonText mt="4" noOfLines={3} rootProps={{ gap: 4 }} />
            </Box>
          ))
        ) : comments.length === 0 ? (
          <Flex direction="column" justify="center" align="center" p={20}>
            <Text fontWeight={600} opacity={0.3}>
              {" "}
              No Comments
            </Text>
          </Flex>
        ) : (
          <TreeView.Root
            collection={collection}
            width="100%"
            expandOnClick={false}
            defaultExpandedValue={comments.map((c) => c.id)}
          >
            <TreeView.Tree>
              <TreeView.Node
                render={({ node, nodeState }) => {
                  const comment = node as unknown as Comment;
                  return nodeState.isBranch ? (
                    <TreeView.BranchControl
                      width="100%"
                      py={2}
                      _hover={{ bg: "transparent" }}
                      _selected={{ bg: "transparent" }}
                      cursor="default"
                    >
                      <Flex width="100%" gap={2}>
                        <Box pt={2}>
                          <TreeView.BranchTrigger>
                            <TreeView.BranchIndicator asChild>
                              <LuChevronRight />
                            </TreeView.BranchIndicator>
                          </TreeView.BranchTrigger>
                        </Box>
                        <Box flex={1}>
                          <CommentItem
                            comment={comment}
                            onDeleteComment={deleteComment}
                            loadingDelete={deleteLoadingId === comment.id}
                            userId={user?.uid}
                            isCommunityAdmin={isCommunityAdmin}
                            onCreateComment={createComment}
                            user={user}
                            canComment={canComment}
                          />
                        </Box>
                      </Flex>
                    </TreeView.BranchControl>
                  ) : (
                    <TreeView.Item
                      width="100%"
                      py={2}
                      _hover={{ bg: "transparent" }}
                      _selected={{ bg: "transparent" }}
                      cursor="default"
                    >
                      <Box pl={6} width="100%">
                        <CommentItem
                          comment={comment}
                          onDeleteComment={deleteComment}
                          loadingDelete={deleteLoadingId === comment.id}
                          userId={user?.uid}
                          isCommunityAdmin={isCommunityAdmin}
                          onCreateComment={createComment}
                          user={user}
                          canComment={canComment}
                        />
                      </Box>
                    </TreeView.Item>
                  );
                }}
              />
            </TreeView.Tree>
          </TreeView.Root>
        )}
      </Stack>
    </Flex>
  );
};
export default Comments;
