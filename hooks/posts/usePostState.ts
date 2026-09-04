import { useAtom } from "jotai";
import { postStateAtom } from "@/atoms/postsAtom";

/**
 * A custom hook that provides access to the global post state managed by Jotai.
 * It returns the current state value and a setter function for updating it.
 * @returns An object containing the post state value and its setter.
 */
const usePostState = () => {
  const [postStateValue, setPostStateValue] = useAtom(postStateAtom);

  return { postStateValue, setPostStateValue };
};

export default usePostState;
