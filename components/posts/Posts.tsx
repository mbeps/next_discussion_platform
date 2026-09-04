import { Button, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import usePostDeletion from "@/hooks/posts/usePostDeletion";
import usePostSelection from "@/hooks/posts/usePostSelection";
import usePostState from "@/hooks/posts/usePostState";
import usePostsFeed from "@/hooks/posts/usePostsFeed";
import usePostVote from "@/hooks/posts/usePostVote";
import usePostVoteSync from "@/hooks/posts/usePostVoteSync";
import type { Community } from "@/types/community";
import PostLoader from "../loaders/post-loader/PostLoader";
import PostItem from "./post-item/PostItem";

type PostsProps = {
  communityData: Community;
};

/**
 * Manages and displays a feed of posts for a specific community.
 * Handles infinite scrolling, post selection, voting, and deletion by coordinating multiple hooks.
 * @param communityData - The community context for which to load and display posts.
 * @returns A scrollable list of post items or a loading state.
 */
const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const { postStateValue, setPostStateValue } = usePostState();
  const { onSelectPost } = usePostSelection(setPostStateValue);
  const { onVote } = usePostVote(postStateValue, setPostStateValue);
  const { onDeletePost } = usePostDeletion(setPostStateValue);
  usePostVoteSync(setPostStateValue);
  const { isAdmin, canPost } = useCommunityPermissions(communityData);

  const { loading, fetchPosts, noMorePosts } = usePostsFeed({
    communityId: communityData.id,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refetch posts on community change
  useEffect(() => {
    fetchPosts(true);
  }, [communityData]);

  return (
    <>
      {/* If loading is true and it's the initial load (no posts yet), display the post loader component */}
      {loading && postStateValue.posts.length === 0 ? (
        <PostLoader />
      ) : (
        // If the posts are available, display the post item components
        <Stack gap={3}>
          {/* For each post (item) iterebly create a post car component */}
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.uid === item.creatorId}
              userIsAdmin={isAdmin}
              userVoteValue={
                postStateValue.postVotes.find((vote) => vote.postId === item.id)
                  ?.voteValue
              }
              onVote={onVote}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
              votingDisabled={!canPost}
            />
          ))}
          {!noMorePosts ? (
            <Button
              onClick={() => fetchPosts(false)}
              loading={loading}
              variant="outline"
              width="100%"
              my={4}
            >
              Load More
            </Button>
          ) : (
            <Text textAlign="center" p={2} fontSize="sm" color="gray.500">
              No more posts
            </Text>
          )}
        </Stack>
      )}
    </>
  );
};
export default Posts;
