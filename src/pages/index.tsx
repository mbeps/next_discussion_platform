/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import PageContent from "@/components/Layout/PageContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/clientApp";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { communityState } from "@/atoms/communitiesAtom";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import usePosts from "@/hooks/usePosts";
import { Post, PostVote } from "@/atoms/postsAtom";
import CreatePostLink from "@/components/Community/CreatePostLink";
import PostLoader from "@/components/Posts/PostLoader";
import { Stack } from "@chakra-ui/react";
import PostItem from "@/components/Posts/PostItem";
import useCommunityData from "@/hooks/useCommunityData";
import Recommendations from "@/components/Community/Recommendations";
import PersonalHome from "@/components/Community/PersonalHome";

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

  const buildUserHomeFeed = async () => {
    setLoading(true);

    try {
      if (communityStateValue.mySnippets.length) {
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        );
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          // orderBy("voteStatus", "desc"),
          limit(10)
        );
        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }));
      } else {
        buildGenericHomeFeed();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const buildGenericHomeFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));
    } catch (error) {
      console.log("Error: buildGenericHomeFeed", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id);
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "in", postIds)
      );
      const postVoteDocs = await getDocs(postVotesQuery);
      const postVotes = postVoteDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    } catch (error) {}
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
          <Stack>
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
