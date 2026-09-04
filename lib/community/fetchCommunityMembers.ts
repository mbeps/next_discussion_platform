import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { CommunityMember } from "@/types/communityMember";

/**
 * Retrieves a list of all members belonging to a specific community.
 * Members are identified by the presence of a community snippet in their user profile.
 * The resulting list is sorted alphabetically by display name or email.
 * @param communityId - The unique identifier of the community.
 * @returns A promise that resolves to a sorted array of community member objects.
 */
export const fetchCommunityMembers = async (
  communityId: string,
): Promise<CommunityMember[]> => {
  const usersSnapshot = await getDocs(collection(firestore, "users"));

  const members = await Promise.all(
    usersSnapshot.docs.map(async (userDoc) => {
      const snippetDoc = await getDoc(
        doc(firestore, "users", userDoc.id, "communitySnippets", communityId),
      );

      if (!snippetDoc.exists()) {
        return null;
      }

      const data = userDoc.data() as {
        email?: string;
        displayName?: string | null;
      };

      return {
        uid: userDoc.id,
        email: data.email || "Unknown email",
        displayName: data.displayName ?? null,
      } satisfies CommunityMember;
    }),
  );

  const filteredMembers = members.filter(
    (member): member is CommunityMember => !!member,
  );

  filteredMembers.sort((a, b) => {
    const nameA = (a.displayName || a.email).toLowerCase();
    const nameB = (b.displayName || b.email).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return filteredMembers;
};
