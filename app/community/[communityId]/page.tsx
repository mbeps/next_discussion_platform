import { notFound } from "next/navigation";
import { getCommunityData } from "@/lib/community/getCommunityData";
import CommunityClientPage from "./comments/CommunityClientPage";

/**
 * A server-side page component that fetches data for a specific community.
 * Validates the community ID and handles error states or non-existent communities by showing a 404 page.
 * @param params - The dynamic route parameters containing the community ID.
 * @returns The client-side community page populated with server-fetched data.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  let communityData;

  try {
    communityData = await getCommunityData(communityId);
  } catch (error) {
    console.log("Error: Page", error);
    return <div>Error loading community</div>;
  }

  if (!communityData) {
    notFound();
  }

  return <CommunityClientPage communityData={communityData} />;
}
