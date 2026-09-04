import { notFound } from "next/navigation";
import { getCommunityData } from "@/lib/community/getCommunityData";
import { getPost } from "@/lib/post/getPost";
import PostClientPage from "./PostClientPage";

/**
 * A server-side page component for viewing a single post and its comments.
 * Fetches both the community and post data to provide full context for the client page.
 * @param params - The dynamic route parameters containing the community ID and post ID.
 * @returns The client-side post detail page.
 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ communityId: string; pid: string }>;
}) {
  const { communityId, pid } = await params;

  let communityData;
  let postData;

  try {
    communityData = await getCommunityData(communityId);
    postData = await getPost(pid);
  } catch (error) {
    console.log("Error: PostPage", error);
    return <div>Error loading page</div>;
  }

  if (!communityData || !postData) {
    notFound();
  }

  return <PostClientPage communityData={communityData} postData={postData} />;
}
