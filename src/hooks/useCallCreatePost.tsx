import { authModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import useDirectory from "./useDirectory";

/**
 * Redirects the user to the create post page if the user is logged in.
 * If the user is not logged in, the login modal is opened.
 * @returns {() => void} onClick - function that handles opening the create post modal
 */
const useCallCreatePost = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);
  const { toggleMenuOpen } = useDirectory();

  /**
   * Redirects the authenticated user to the post creation page.
   * If the user is not authenticated, the authentication modal will be opened.
   * If the user is not in a community page (ie. home page), the directory menu will be opened to allow the user to navigate to a community.
   * If the user is in a community page, then they will be redirected to the community's post creation page.
   */
  const onClick = () => {
    // check if the user is logged in as post cannot be created without user
    if (!user) {
      // if user is not logged in
      setAuthModalState({ open: true, view: "login" }); // open login modal
      return; // exit function
    }
    const { communityId } = router.query; // get community id from router

    if (communityId) {
      // if the user is in a community then can post
      // redirect user to following link
      router.push(`/community/${communityId}/submit`); // redirect user to create post page
      return;
    } else {
      // if the user is not in a community then post cannot be made
      toggleMenuOpen(); // open the menu to select a community
    }
  };

  return {
    onClick,
  };
};
export default useCallCreatePost;
