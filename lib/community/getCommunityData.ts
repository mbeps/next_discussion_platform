import { doc, getDoc } from "firebase/firestore";
import safeJsonStringify from "safe-json-stringify";
import { firestore } from "@/firebase/clientApp";

/**
 * Retrieves community data by id with JSON-safe serialization.
 * @param communityId - Id of the community to fetch.
 * @returns Community object or null if it does not exist.
 */
export async function getCommunityData(communityId: string) {
  try {
    const communityDocRef = doc(firestore, "communities", communityId);
    const communityDoc = await getDoc(communityDocRef);

    if (!communityDoc.exists()) {
      return null;
    }

    return JSON.parse(
      safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() }),
    );
  } catch (error) {
    console.log("Error: getCommunityData", error);
    throw error;
  }
}
