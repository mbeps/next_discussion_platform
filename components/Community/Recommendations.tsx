import { Community } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Flex,
  Icon,
  Link,
  Skeleton,
  Stack,
  Image,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";

/**
 * Displays the top 5 communities with the most members.
 * For each community, displays the community name, number of members, and a button to join or leave the community.
 * Displays a button to view all communities.
 * @returns {React.FC} - Recommendations component
 *
 * @requires SuggestionsHeader - Displays the header for the Recommendations component.
 * @requires SuggestedCommunitiesList - Displays the top 5 communities with the most members.
 */
const Recommendations: React.FC = () => {
  return (
    <Flex
      direction="column"
      position="relative"
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.300"
      shadow="md"
    >
      <SuggestionsHeader />

      <Flex direction="column" mb={2}>
        <SuggestedCommunitiesList />
      </Flex>
    </Flex>
  );
};
export default Recommendations;

/**
 * Displays the header for the Recommendations component.
 * Header includes the title "Top Communities" and a banner image with a gradient.
 * @returns {React.FC} - Recommendations header component
 */
const SuggestionsHeader: React.FC = () => {
  const bannerImage = "/images/banners/large.png";
  return (
    <Flex
      align="flex-end"
      color="white"
      p="6px 10px"
      height="70px"
      borderTopRadius="lg"
      fontWeight={700}
      bgImage="linear-gradient(to bottom, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.75)), url('/images/banners/large.png')"
      backgroundSize="cover"
    >
      Top Communities
    </Flex>
  );
};

/**
 * Displays the top 5 communities with the most members.
 * @returns {React.FC} - Suggested communities list component
 */
const SuggestedCommunitiesList: React.FC = () => {
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const router = useRouter();
  const showToast = useCustomToast();

  /**
   * Gets the top 5 communities with the most members.
   */
  const getCommunityRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc"),
        limit(5)
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
        title: "Recommendations not Loaded",
        description: "There was an error loading recommendations",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    getCommunityRecommendations();
  }, [getCommunityRecommendations]);

  return (
    <Flex direction="column" mb={0}>
      {loading ? (
        <Stack mt={2} p={3}>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Flex justify="space-between" align="center" key={index}>
                <Skeleton borderRadius="full" boxSize="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
            ))}
        </Stack>
      ) : (
        <>
          {communities.map((item, index) => {
            const isJoined = !!communityStateValue.mySnippets.find(
              (snippet) => snippet.communityId === item.id
            );
            return (
              <Link
                key={item.id}
                href={`/community/${item.id}`}
                display="block"
                w="100%"
              >
                <Flex
                  align="center"
                  justify="space-between"
                  fontSize="10pt"
                  p="10px 12px"
                >
                  <Flex align="center" gap={2} minWidth={0} flex={1} mr={2}>
                    <Text flexShrink={0} width="20px">
                      {index + 1}
                    </Text>
                    {item.imageURL ? (
                      <Image
                        src={item.imageURL}
                        borderRadius="full"
                        boxSize="28px"
                        alt="Community Icon"
                        flexShrink={0}
                      />
                    ) : (
                      <Icon
                        as={IoPeopleCircleOutline}
                        fontSize={34}
                        color="red.500"
                        flexShrink={0}
                      />
                    )}
                    <Text
                      fontWeight={600}
                      fontSize="10pt"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {item.id}
                    </Text>
                  </Flex>
                  <Button
                    height="24px"
                    fontSize="8pt"
                    px={4}
                    variant={isJoined ? "outline" : "solid"}
                    flexShrink={0}
                    onClick={(event) => {
                      event.preventDefault();
                      onJoinOrLeaveCommunity(item, isJoined);
                    }}
                  >
                    {isJoined ? "Unsubscribe" : "Subscribe"}
                  </Button>
                </Flex>
              </Link>
            );
          })}
        </>
      )}
      <Box p="10px 20px">
        <Button
          height="30px"
          width="100%"
          onClick={() => {
            router.push(`/communities`);
          }}
        >
          View All
        </Button>
      </Box>
    </Flex>
  );
};
