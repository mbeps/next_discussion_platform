import { useRouter } from "next/navigation";
import type { Post, PostVote } from "@/types/post";

/**
 * A custom hook that handles the selection of a post and navigation to its detailed comment view.
 * It updates the global post state to track the currently selected post.
 * @param setPostStateValue - A state setter function to update the global post state.
 * @returns An object containing the `onSelectPost` function.
 */
const usePostSelection = (
  setPostStateValue: React.Dispatch<
    React.SetStateAction<{
      selectedPost: Post | null;
      posts: Post[];
      postVotes: PostVote[];
    }>
  >,
) => {
  const router = useRouter();

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }));
    router.push(`/community/${post.communityId}/comments/${post.id}`);
  };

  return { onSelectPost };
};

export default usePostSelection;
