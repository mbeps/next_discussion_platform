"use client";

import { Button, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import CreatePostLink from "@/components/community/CreatePostLink";
import PersonalHome from "@/components/community/PersonalHome";
import Recommendations from "@/components/community/recommendations/Recommendations";
import PageContent from "@/components/layout/PageContent";
import PostLoader from "@/components/loaders/post-loader/PostLoader";
import PostItem from "@/components/posts/post-item/PostItem";
import { auth } from "@/firebase/clientApp";
import useCommunityState from "@/hooks/community/useCommunityState";
import usePostDeletion from "@/hooks/posts/usePostDeletion";
import usePostSelection from "@/hooks/posts/usePostSelection";
import usePostState from "@/hooks/posts/usePostState";
import usePostsFeed from "@/hooks/posts/usePostsFeed";
import usePostVote from "@/hooks/posts/usePostVote";
import usePostVoteSync from "@/hooks/posts/usePostVoteSync";

/**
 * The main landing page of the application.
 * Displays a personalized feed of posts for authenticated users or a generic popular feed for guests.
 * Includes a sidebar with community recommendations and personal shortcuts.
 * @returns The home page component with infinite scrolling posts.
 */
export default function Home() {
  const [user, loadingUser] = useAuthState(auth);
  const { communityStateValue } = useCommunityState();
  const { postStateValue, setPostStateValue } = usePostState();
  const { onSelectPost } = usePostSelection(setPostStateValue);
  const { onVote, getPostVotes } = usePostVote(
    postStateValue,
    setPostStateValue,
  );
  const { onDeletePost } = usePostDeletion(setPostStateValue);
  usePostVoteSync(setPostStateValue);

  const communityIds = useMemo(
    () => communityStateValue.mySnippets.map((snippet) => snippet.communityId),
    [communityStateValue.mySnippets],
  );

  const { loading, fetchPosts, noMorePosts } = usePostsFeed({
    communityIds: user && communityIds.length > 0 ? communityIds : undefined,
    isGenericHome: !user || communityIds.length === 0,
  });

  /**
   * Loads the home feed for authenticated users.
   * Runs when the community snippets have been fetched when the user
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refetch posts when user authentication, snippets, or community count changes
  useEffect(() => {
    if (communityStateValue.snippetFetched) {
      fetchPosts(true);
    }
  }, [communityStateValue.snippetFetched, user, communityIds.length]);

  /**
   * Loads the home feed for unauthenticated users.
   * Runs when there is no user and the system is no longer attempting to fetch a user.
   * While the system is attempting to fetch user, the user is null.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch generic posts when unauthenticated
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchPosts(true);
    }
  }, [user, loadingUser]);

  /**
   * Posts need to exist before trying to fetch votes for posts
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch post votes when posts or user changes
  useEffect(() => {
    if (user && postStateValue.posts.length) {
      const postIds = postStateValue.posts.map((post) => post.id!);
      getPostVotes(postIds);

      return () => {
        setPostStateValue((prev) => ({
          ...prev,
          postVotes: [],
        }));
      };
    }
  }, [user, postStateValue.posts]);

  return (
    <PageContent>
      <Stack gap={3}>
        <CreatePostLink />
        {loading && postStateValue.posts.length === 0 ? (
          <PostLoader />
        ) : (
          <Stack gap={3}>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id,
                  )?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                userIsAdmin={
                  !!communityStateValue.mySnippets.find(
                    (snippet) => snippet.communityId === post.communityId,
                  )?.isAdmin
                }
                showCommunityImage={true}
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
      </Stack>
      <Stack gap={2}>
        <Recommendations />
        <PersonalHome />
      </Stack>
    </PageContent>
  );
}
