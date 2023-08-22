/* eslint-disable react-hooks/exhaustive-deps */
import { Post, PostVote } from "@/atoms/postsAtom";
import CreatePostLink from "@/components/Community/CreatePostLink";
import PersonalHome from "@/components/Community/PersonalHome";
import Recommendations from "@/components/Community/Recommendations";
import PageContent from "@/components/Layout/PageContent";
import PostLoader from "@/components/Loaders/PostLoader";
import PostItem from "@/components/Posts/PostItem";
import { auth, firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { Inter } from "@next/font/google";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const { communityStateValue } = useCommunityData();
  const {
    setPostStateValue,
    postStateValue,
    onSelectPost,
    onVote,
    onDeletePost,
  } = usePosts();
  const showToast = useCustomToast();

  /**
   * Creates a home feed for a currently logged in user.
   * If the user is a member of any communities, it will display posts from those communities.
   * If the user is not a member of any communities, it will display generic posts.
   */
  const buildUserHomeFeed = async () => {
    setLoading(true);

    try {
      if (communityStateValue.mySnippets.length) {
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        ); // get all community ids that the user is a member of
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          // orderBy("voteStatus", "desc"),
          limit(10)
        ); // get all posts in community with certain requirements
        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); // get all posts in community

        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        })); // set posts in state
      } else {
        buildGenericHomeFeed();
      }
    } catch (error) {
      showToast({
        title: "Could not Build Home Feed",
        description: "There was an error while building your home feed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a generic home feed for a user that is not logged in.
   */
  const buildGenericHomeFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      ); // get all posts in community with certain requirements

      const postDocs = await getDocs(postQuery); // get all posts in community
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // get all posts in community
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      })); // set posts in state
    } catch (error) {
      console.log("Error: buildGenericHomeFeed", error);
      showToast({
        title: "Could not Build Home Feed",
        description: "There was an error while building your home feed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets the votes for the posts that are currently in the home feed.
   */
  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id); // get all post ids in home feed
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "in", postIds)
      ); // get all post votes for posts in home feed
      const postVoteDocs = await getDocs(postVotesQuery);
      const postVotes = postVoteDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // get all post votes for posts in home feed

      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      })); // set post votes in state
    } catch (error) {
      console.log("Error: getUserPostVotes", error);
      showToast({
        title: "Could not Get Post Votes",
        description: "There was an error while getting your post votes",
        status: "error",
      });
    }
  };

  /**
   * Loads the home feed for authenticated users.
   * Runs when the community snippets have been fetched when the user
   */
  useEffect(() => {
    if (communityStateValue.mySnippets) {
      buildUserHomeFeed();
    }
  }, [communityStateValue.snippetFetched]);

  /**
   * Loads the home feed for unauthenticated users.
   * Runs when there is no user and the system is no longer attempting to fetch a user.
   * While the system is attempting to fetch user, the user is null.
   */
  useEffect(() => {
    if (!user && !loadingUser) {
      buildGenericHomeFeed();
    }
  }, [user, loadingUser]);

  /**
   * Posts need to exist before trying to fetch votes for posts
   */
  useEffect(() => {
    if (user && postStateValue.posts.length) {
      getUserPostVotes();

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
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack spacing={3}>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                showCommunityImage={true}
              />
            ))}
          </Stack>
        )}
      </>
      <Stack spacing={2}>
        <Recommendations />
        <PersonalHome />
      </Stack>
    </PageContent>
  );
}
