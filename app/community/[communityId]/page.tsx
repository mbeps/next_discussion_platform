import { Community } from "@/atoms/communitiesAtom";
import CommunityPageClient from "@/components/Community/CommunityPageClient";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "@firebase/firestore";
import safeJsonStringify from "safe-json-stringify";

interface PageProps {
  params: { communityId: string };
}

export default async function CommunityPage({ params }: PageProps) {
  try {
    const communityDocRef = doc(firestore, "communities", params.communityId);
    const communityDoc = await getDoc(communityDocRef);

    if (!communityDoc.exists()) {
      return <CommunityPageClient />;
    }

    const communityData = JSON.parse(
      safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
    ) as Community;

    return <CommunityPageClient communityData={communityData} />;
  } catch (error) {
    console.log("Error: fetchCommunityData", error);
    return <CommunityPageClient />;
  }
}
