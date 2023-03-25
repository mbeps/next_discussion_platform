import { Community } from "@/atoms/communitiesAtom";
import CommunityItem from "@/components/Community/CommunityItem";
import PersonalHome from "@/components/Community/PersonalHome";
import PageContent from "@/components/Layout/PageContent";
import CommunityLoader from "@/components/Loaders/CommunityLoader";
import { firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import { Button, Flex, Stack } from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

/**
 * Displays the communities page with the top 5 communities.
 * Pressing the "See More" button will display the next 5 communities.
 * @returns {React.FC} - the communities page with the top 5 communities.
 */
const Communities: React.FC = () => {
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const router = useRouter();
  const showToast = useCustomToast();

  /**
   * Gets the top 5 communities with the most members.
   * @param {number} numberOfExtraPosts - number of extra posts to display
   */
  const getCommunities = async (numberOfExtraPosts: number) => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc"),
        limit(5 + numberOfExtraPosts)
      );
      const communityDocs = await getDocs(communityQuery);
      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(communities as Community[]);
    } catch (error) {
      console.log("Error: getCommunityRecommendations", error);
      showToast({
        title: "Could not Find Communities",
        description: "There was an error getting communities",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCommunities(0);
  }, []);

  return (
    <>
      <PageContent>
        <>
          <Stack direction="column" borderRadius={10} spacing={3}>
            {loading ? (
              <Stack mt={2} p={3}>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <CommunityLoader key={index} />
                  ))}
              </Stack>
            ) : (
              <>
                {communities.map((community, index) => {
                  const isJoined = !!communityStateValue.mySnippets.find(
                    (snippet) => snippet.communityId === community.id
                  );
                  return (
                    <CommunityItem
                      key={index}
                      community={community}
                      isJoined={isJoined}
                      onJoinOrLeaveCommunity={onJoinOrLeaveCommunity}
                    />
                  );
                })}
              </>
            )}
            <Flex p="10px 20px" alignContent="center" justifyContent="center">
              <Button
                height="34px"
                width="200px"
                onClick={() => {
                  getCommunities(5);
                }}
                shadow="md"
                isLoading={loading}
              >
                View More
              </Button>
            </Flex>
          </Stack>
        </>
        <Stack spacing={2}>
          <PersonalHome />
        </Stack>
        <></>
      </PageContent>
    </>
  );
};
export default Communities;
