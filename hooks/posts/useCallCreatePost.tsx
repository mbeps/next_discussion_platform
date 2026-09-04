import { useSetAtom } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { authModalStateAtom } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "../useDirectory";

/**
 * A custom hook that handles the logic for initiating the post creation process.
 * It checks for user authentication and either navigates to the community's submit page
 * or opens the directory menu to allow the user to select a community.
 * @returns An object containing the `onClick` handler for the "Create Post" action.
 */
const useCallCreatePost = () => {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetAtom(authModalStateAtom);
  const { toggleMenuOpen } = useDirectory();

  const onClick = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    const communityId = params?.communityId;

    if (communityId) {
      router.push(`/community/${communityId}/submit`);
      return;
    } else {
      toggleMenuOpen();
    }
  };

  return {
    onClick,
  };
};
export default useCallCreatePost;
