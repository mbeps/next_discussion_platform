/* eslint-disable react-hooks/exhaustive-deps */
import { authModalState } from "@/atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "@/atoms/communitiesAtom";
import { auth, firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import useCustomToast from "./useCustomToast";

/**
 * Checks whether a user is subscribed to a community.
 * Contains the current community state (`communitiesState`).
 * Contains functionality to subscribe or unsubscribe to a community.
 *
 * @returns {Community} currentCommunity - object containing the current community state, including the user's community snippets
 * @returns {() => void} onJoinOrLeaveCommunity - function that handles subscribing or unsubscribing a community
 * @returns {boolean} loading - indicates whether a community operation is currently in progress
 */
const useCommunityData = () => {
  const [user] = useAuthState(auth);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();
  const showToast = useCustomToast();

  /**
   * Handles the user subscribing or unsubscribing to a community.
   * If the user is not currently authenticated, the authentication modal is opened.
   * If the user is already subscribed, then the function will unsubscribe the user from the community.
   * If the user is not subscribed, then the function will subscribe the user to the community.
   * @param {Community} communityData - object is an object representing the community being joined or left
   * @param {boolean} isJoined - indicates whether the user is currently a member of the community
   */
  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // open the authentication modal if the user is not logged in
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setLoading(true);

    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);

    setLoading(false);
  };

  /**
   * Fetches the user's subscribed communities.
   * @async
   * @throws {error} - failed to fetch required data
   */
  const getMySnippets = async () => {
    setLoading(true);
    try {
      // fetch document storing the snippets representing subscriptions
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetFetched: true,
      }));
    } catch (error: any) {
      console.log("Error: getMySnippets", error);
      showToast({
        title: "Subscriptions not Found",
        description: "There was an error fetching your subscriptions",
        status: "error",
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Subscribes the currently authenticated user to the community.
   *
   * @param communityData (Community) - community to which the user is subscribed to
   * @throws error - error in subscribing to a community
   */
  const joinCommunity = async (communityData: Community) => {
    try {
      const batch = writeBatch(firestore);

      // creates a new snippet representing the subscription (from current page)
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id, // community id from the current community page
        imageURL: communityData.imageURL || "", // community image from the current community page
        // if the creator of community re-subscribes to the community
        isAdmin: user?.uid === communityData.creatorId, // if the user is the creator of the community
      };

      // create a new community snippet into the user document (subscription)
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );

      // updating the number of members
      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      });

      await batch.commit();
      // update state to update the UI
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (error: any) {
      console.log("Error: joinCommunity", error);
      showToast({
        title: "Could not Subscribe",
        description: "There was an error subscribing to the community",
        status: "error",
      });
      setError(error.message);
    }
    setLoading(false);
  };

  /**
   * Fetches the community data from the database and updates the state by storing it in the Recoil atom.
   * @param {string} communityId - community id of the community to be fetched
   *
   * @async
   */
  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(firestore, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);

      // update state to update the UI by selecting the community
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (error) {
      console.log("Error: getCommunityData", error);
      showToast({
        title: "Could not Fetch Communities",
        description: "There was an error fetching your communities",
        status: "error",
      });
    }
  };

  /**
   * Unsubscribes the currently authenticated user from the community
   * @param {string} communityId - community from which the user is unsubscribed from
   *
   * @async
   *
   * @throws {any} error - error in subscribing to a community
   */
  const leaveCommunity = async (communityId: string) => {
    try {
      const batch = writeBatch(firestore);

      // delete new community snippet
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );

      // updating the number of members
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      // update state to update the UI
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }));
    } catch (error: any) {
      console.log("Error: leaveCommunity", error.message);
      setError(error.message);
      showToast({
        title: "Could not Unsubscribe",
        description: "There was an error unsubscribing from the community",
        status: "error",
      });
    }
    setLoading(false);
  };

  /**
   * Every time the user changes, it will check again.
   * Clears all the user data when the user logs out.
   */
  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetFetched: false,
      }));
      return;
    }
    getMySnippets();
  }, [user]);

  /**
   * Fetches the community data when the communityId changes.
   * This is used to fetch the community data when the user navigates to a community page.
   * The community data is stored in the communityState.
   */
  useEffect(() => {
    const { communityId } = router.query; // get the communityId from the URL
    if (communityId && !communityStateValue.currentCommunity) {
      // if the communityId exists and the community data is not already fetched
      getCommunityData(communityId as string); // fetch the community data
    }
  }, [communityStateValue.currentCommunity, router.query]);

  return {
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
};

export default useCommunityData;
