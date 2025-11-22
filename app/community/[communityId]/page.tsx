import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import safeJsonStringify from "safe-json-stringify";
import CommunityClientPage from "./CommunityClientPage";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  let communityData;

  try {
    const communityDocRef = doc(firestore, "communities", communityId);
    const communityDoc = await getDoc(communityDocRef);

    if (!communityDoc.exists()) {
      notFound();
    }

    communityData = JSON.parse(
      safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
    );
  } catch (error) {
    console.log("Error: Page", error);
    return <div>Error loading community</div>;
  }

  return <CommunityClientPage communityData={communityData} />;
}
