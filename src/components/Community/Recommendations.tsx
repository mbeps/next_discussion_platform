import { Community } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import {
  Flex,
  Icon,
  Link,
  Skeleton,
  SkeletonCircle,
  Stack,
  Image,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";

const Recommendations: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  const bannerImage = "/images/banners/large.png";

  const getCommunityRecommendations = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCommunityRecommendations();
  }, []);

  return (
    <Flex
      direction="column"
      position="relative"
      bg="white"
      borderRadius={10}
      border="1px solid"
      borderColor="gray.300"
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        height="70px"
        borderRadius="10px 10px 0px 0px"
        fontWeight={700}
        bgImage="url(/images/banners/large.png)"
        backgroundSize="cover"
        bgGradient="linear-gradient(to bottom, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.75)),
        url('/images/banners/large.png')"
      >
        Top Communities
      </Flex>
      <Flex direction="column" mb={2}>
        {loading ? (
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {communities.map((item, index) => {
              const isJoined = !!communityStateValue.mySnippets.find(
                (snippet) => snippet.communityId === item.id
              );
              return (
                <Link key={item.id} href={`/community/${item.id}`}>
                  <Flex
                    align="center"
                    fontSize="10pt"
                    borderBottom="1px solid"
                    borderColor="gray.300"
                    p="10px 12px"
                  >
                    <Flex width="80%" align="center">
                      <Flex width="15%">
                        <Text>{index + 1}</Text>
                      </Flex>
                      <Flex align="center" width="80%">
                        {item.imageURL ? (
                          <Image
                            src={item.imageURL}
                            borderRadius="full"
                            boxSize="28px"
                            mr={2}
                            alt="Community Icon"
                          />
                        ) : (
                          <Icon
                            as={IoPeopleCircleOutline}
                            fontSize={34}
                            color="red.500"
                            mr={1}
                          />
                        )}
                        {/* show dots when community name doesnt fit */}
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {`${item.id}`}
                        </span>
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="24px"
                        fontSize="8pt"
                        variant={isJoined ? "outline" : "solid"}
                        onClick={(event) => {
                          event.preventDefault();
                          onJoinOrLeaveCommunity(item, isJoined);
                        }}
                      >
                        {isJoined ? "Unsubscribe" : "Subscribe"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })}
            <Box p="10px 20px">
              <Button height="30px" width="100%">
                View All
              </Button>
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
};
export default Recommendations;
