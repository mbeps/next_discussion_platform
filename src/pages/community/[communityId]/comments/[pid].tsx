import { Post } from "@/atoms/postsAtom";
import PageContent from "@/components/Layout/PageContent";
import PostItem from "@/components/Posts/PostItem";
import { auth, firestore } from "@/firebase/clientApp";
import usePosts from "@/hooks/usePosts";
import { doc, getDoc } from "@firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const [user] = useAuthState(auth);
  const router = useRouter();

  /**
   * Single post page received all the necessary post data (state) from community page.
   * Refreshing the page or pasting link to the post loads an empty page.
   * This is because the community page was bypassed hence the state is empty.
   * If the state is empty then fetch the data from Firebase.
   * @param postId
   */
  const fetchPost = async (postId: string) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...(postDoc.data() as Post) },
      }));
    } catch (error) {
      console.log("Error: fetchPost", error);
    }
  };

  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
  }, [postStateValue.selectedPost, router.query]);

  return (
    <PageContent>
      {/* Right */}
      <>
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
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}
      </>

      {/* Left */}
      <></>
    </PageContent>
  );
};
export default PostPage;
