import { notFound } from "next/navigation";
import { getCommunityData } from "@/lib/community/getCommunityData";
import SubmitPostClientPage from "./SubmitPostClientPage";

/**
 * A server-side page component for the post submission route.
 * Fetches the target community's data to ensure it exists and to provide context for the submission form.
 * @param params - The dynamic route parameters containing the community ID.
 * @returns The client-side post submission page.
 */
export default async function SubmitPostPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  let communityData;

  try {
    communityData = await getCommunityData(communityId);
  } catch (error) {
    console.log("Error: SubmitPostPage", error);
    return <div>Error loading community</div>;
  }

  if (!communityData) {
    notFound();
  }

  return <SubmitPostClientPage communityData={communityData} />;
}
