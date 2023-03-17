/* eslint-disable react-hooks/exhaustive-deps */
import { Post, postState } from "@/atoms/postsAtom";
import { firestore } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Box,
  Divider,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import CommentInput from "./CommentInput";
import CommentItem, { Comment } from "./CommentItem";

/**
 * Required props for Comments component
 * @param {User} user - User object from firebase
 * @param {Post} selectedPost - Post object from firebase
 * @param {string} communityId - id of the community
 */
type CommentsProps = {
  user?: User;
  selectedPost: Post | null;
  communityId: string;
};

/**
 * Displays all the comments for a post.
 * Allows user to create, edit and delete comments.
 *
 * If there are no comments, displays a message.
 * Show loading skeleton while fetching comments.
 * If everything is loaded, show the comments.
 * @param {User} user - User object from firebase
 * @param {Post} selectedPost - Post object from firebase
 * @param {string} communityId - id of the community
 *
 * @returns {React.FC<CommentsProps>} - Comments component
 */
const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId,
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState("");
  const setPostState = useSetRecoilState(postState);
  const showToast = useCustomToast();

  /**
   * Creates a new comment for the selected post.
   * Also updates the number of comments in the post document.
   *
   * @returns {Promise<void>} - void
   *
   * @async
   */
  const onCreateComment = async () => {
    setCreateLoading(true);
    try {
      const batch = writeBatch(firestore);

      const commentDocRef = doc(collection(firestore, "comments")); // create new comment document

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user!.uid,
        creatorDisplayText: user!.email!.split("@")[0],
        communityId,
        postId: selectedPost?.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
      }; // create new comment object with data to be stored in firestore

      batch.set(commentDocRef, newComment); // add new comment to batch

      const postDocRef = doc(firestore, "posts", selectedPost?.id as string); // get post document
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      }); // update number of comments in post document
      await batch.commit();

      setCommentText(""); // once comment is submitted clear comment box
      setComments((prev) => [newComment, ...prev]); // display new comment along with old comments after it
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      })); // update number of comments in post state

      showToast({
        title: "Comment Created",
        description: "Your comment has been created",
        status: "success",
      });
    } catch (error) {
      console.log("Error: OnCreateComment", error);
      showToast({
        title: "Comment not Created",
        description: "There was an error creating your comment",
        status: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * Deletes a comment.
   * Also updates the number of comments in the post document.
   * @param {Comment} comment - Comment to be deleted
   */
  const onDeleteComment = async (comment: Comment) => {
    setLoadingDelete(comment.id);
    try {
      const batch = writeBatch(firestore);

      const commentDocRef = doc(firestore, "comments", comment.id); // get comment document
      batch.delete(commentDocRef); // delete comment document

      const postDocRef = doc(firestore, "posts", selectedPost?.id!); // get post document
      batch.update(postDocRef, {
        numberOfComments: increment(-1),
      }); // update number of comments in post document

      await batch.commit();

      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! - 1,
        } as Post,
      })); // update number of comments in post state

      setComments((prev) => prev.filter((item) => item.id !== comment.id)); // remove comment from comments state

      showToast({
        title: "Comment Deleted",
        description: "Your comment has been deleted",
        status: "success",
      });
    } catch (error) {
      console.log("Error: onDeleteComment");
      showToast({
        title: "Comment not Deleted",
        description: "There was an error creating your comment",
        status: "error",
      });
    } finally {
      setLoadingDelete("");
    }
  };
  const getPostComments = async () => {
    try {
      const commentsQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", selectedPost?.id),
        orderBy("createdAt", "desc")
      );
      const commentsDocs = await getDocs(commentsQuery);
      const comments = commentsDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(comments as Comment[]);
    } catch (error) {
      console.log("Error: getPostComments", error);
      showToast({
        title: "Comments not Fetched",
        description: "There was an error fetching comments",
        status: "error",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  /**
   * Fetch comments for the selected post when selected post changes.
   * If there is no selected post then do not fetch comments.
   */
  useEffect(() => {
    if (!selectedPost) {
      return;
    }
    getPostComments();
  }, [selectedPost]);

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor="gray.300"
      bg="white"
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
        <CommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          user={user}
          createLoading={createLoading}
          onCreateComment={onCreateComment}
        />
      </Flex>
      <Stack spacing={4} m={4} ml={10}>
        {fetchLoading ? (
          <>
            {[0, 1, 2, 3].map((item) => (
              <Box key={item} padding="6" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={3} spacing="4" />
              </Box>
            ))}
          </>
        ) : (
          <>
            {comments.length === 0 ? (
              <Flex direction="column" justify="center" align="center" p={20}>
                <Text fontWeight={600} opacity={0.3}>
                  {" "}
                  No Comments
                </Text>
              </Flex>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDeleteComment={onDeleteComment}
                    loadingDelete={loadingDelete === comment.id}
                    userId={user?.uid}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Stack>
    </Flex>
  );
};
export default Comments;
