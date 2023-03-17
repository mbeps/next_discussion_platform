/* eslint-disable react-hooks/exhaustive-deps */
import { Post } from "@/atoms/postsAtom";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
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
import React, { useEffect } from "react";
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

  /**
   * Single post page received all the necessary post data (state) from community page.
   * Refreshing the page or pasting link to the post loads an empty page.
   * This is because the community page was bypassed hence the state is empty.
   * If the state is empty then fetch the data from Firebase.
   * @param {string} postId  - Post ID for the post to be fetched
   */
  const fetchPost = async (postId: string) => {
    try {
      const postDocRef = doc(firestore, "posts", postId); // Get post document reference
      const postDoc = await getDoc(postDocRef); // Get post document
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...(postDoc.data() as Post) },
      })); // Set post state
    } catch (error) {
      console.log("Error: fetchPost", error);
      showToast({
        title: "Could not Find Posts",
        description: "There was an error finding posts",
        status: "error",
      });
    }
  };

  /**
   * Fetch post data if the state is empty and the post ID is available.
   * This is to prevent fetching the post data when the user is on the community page.
   * The post data is already available in the state.
   */
  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
    // render `NotFound` page if post is not found
    if (!postStateValue.selectedPost) {
      router.push("/404");
      return;
    }
  }, [postStateValue.selectedPost, router.query]);

  return (
    <PageContent>
      {/* Right */}
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
      {communityStateValue.currentCommunity && (
        <About communityData={communityStateValue.currentCommunity} />
      )}
      {/* Left */}
      <></>
    </PageContent>
  );
};
export default PostPage;
