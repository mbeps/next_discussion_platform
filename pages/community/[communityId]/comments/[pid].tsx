/* eslint-disable react-hooks/exhaustive-deps */
import { Post } from "@/atoms/postsAtom";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
import PostLoader from "@/components/Loaders/PostLoader";
import Comments from "@/components/Posts/Comments/Comments";
import PostItem from "@/components/Posts/PostItem";
import { auth, firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { doc, getDoc } from "@firebase/firestore";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

/**
 * Displays a single post.
 * Contains:
 *  - PostItem component
 *  - About component
 *  - Comments component
 *
 * @returns {React.FC} - Single post page with all components
 */
const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const { communityStateValue } = useCommunityData();
  const [user] = useAuthState(auth);
  const router = useRouter();
  const showToast = useCustomToast();
  const [hasFetched, setHasFetched] = useState(false);
  const [postExists, setPostExists] = useState(true);
  const [postLoading, setPostLoading] = useState(false);

  /**
   * The necessary data for this page should be passed as props from the previous page.
   * If the user navigates to this page directly (using link), the data will not be available.
   * This function fetches the data from Firebase and populates the state.
   * The function checks if the post exists.
   *
   * @param {string} postId  - Post ID for the post to be fetched
   */
  const fetchPost = async (postId: string) => {
    setPostLoading(true);
    try {
      setHasFetched(false); // Reset fetching attempt status
      const postDocRef = doc(firestore, "posts", postId); // Get post document reference
      const postDoc = await getDoc(postDocRef); // Get post document

      if (postDoc.exists()) {
        // If post exists
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: { id: postDoc.id, ...(postDoc.data() as Post) },
        })); // Set post state
        setPostExists(true); // Set post existence to true
      } else {
        // If post does not exist
        setPostExists(false); // Set post existence to false if post not found
      }
    } catch (error) {
      console.log("Error: fetchPost", error);
      showToast({
        title: "Could not Find Posts",
        description: "There was an error finding posts",
        status: "error",
      });
      setPostExists(false); // Set post existence to false on error
    } finally {
      setHasFetched(true); // Set fetching attempt status to true when finished
      setPostLoading(false);
    }
  };
  /**
   * Fetch post data if the state is empty and the post ID is available.
   * This is to prevent fetching the post data when the user is on the community page.
   * The post data is already available in the state.
   *
   * Runs when the page is loaded, when the post ID changes, and when the post state changes.
   * Checks if the post data is available in the state (when the user navigates to this page from another page).
   * If the post state is empty due the user navigating to the page directly, it will fetch the post data.
   * if the post data is not valid, it will redirect to the `404` page.
   */
  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }

    // If fetching attempt has been completed and post does not exist, redirect to `NotFound` page
    if (hasFetched && !postExists) {
      router.push("/404");
      return;
    }
  }, [postStateValue.selectedPost, router.query, hasFetched, postExists]);

  return (
    <PageContent>
      {/* Left */}
      <>
        {postLoading ? (
          <PostLoader />
        ) : (
          <>
            <Stack spacing={3} direction="column">
              {postStateValue.selectedPost && (
                <PostItem
                  post={postStateValue.selectedPost}
                  onVote={onVote}
                  onDeletePost={onDeletePost}
                  userVoteValue={
                    postStateValue.postVotes.find(
                      (item) => item.postId === postStateValue.selectedPost?.id
                    )?.voteValue
                  }
                  userIsCreator={
                    user?.uid === postStateValue.selectedPost?.creatorId
                  }
                  showCommunityImage={true}
                />
              )}

              <Comments
                user={user as User}
                selectedPost={postStateValue.selectedPost}
                communityId={postStateValue.selectedPost?.communityId as string}
              />
            </Stack>
          </>
        )}
      </>
      {communityStateValue.currentCommunity && (
        <About communityData={communityStateValue.currentCommunity} />
      )}
      {/* Right */}
      <></>
    </PageContent>
  );
};
export default PostPage;
