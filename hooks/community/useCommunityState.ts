import { useAtom } from "jotai";
import { communityStateAtom } from "@/atoms/communitiesAtom";

/**
 * A custom hook that provides access to the global community state managed by Jotai.
 * It returns the current state value and a setter function for updating it.
 * @returns An object containing the community state value and its setter.
 */
const useCommunityState = () => {
  const [communityStateValue, setCommunityStateValue] =
    useAtom(communityStateAtom);

  return {
    communityStateValue,
    setCommunityStateValue,
  };
};

export default useCommunityState;
