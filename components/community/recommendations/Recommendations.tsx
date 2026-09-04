import {
  Box,
  Button,
  Flex,
  Skeleton,
  SkeletonCircle,
  Stack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import useCommunitiesFeed from "@/hooks/community/useCommunitiesFeed";
import useCommunityMembershipActions from "@/hooks/community/useCommunityMembershipActions";
import useCommunityState from "@/hooks/community/useCommunityState";
import RecommendationRow from "./RecommendationRow";
import SuggestionsHeader from "./SuggestionsHeader";

/**
 * Displays the top 5 communities with the most members.
 * @returns {React.FC} - the recommendations component.
 */
const Recommendations: React.FC = () => {
  const { communityStateValue } = useCommunityState();
  const { onJoinOrLeaveCommunity } = useCommunityMembershipActions();
  const { communities, loading } = useCommunitiesFeed({ limitValue: 5 });
  const router = useRouter();

  return (
    <Flex
      direction="column"
      position="relative"
      bg={{ base: "white", _dark: "gray.800" }}
      borderRadius="lg"
      border="1px solid"
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      shadow="md"
    >
      <SuggestionsHeader />

      <Flex direction="column">
        {loading ? (
          <Stack mt={2} p={3}>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Flex justify="space-between" align="center" key={index}>
                  <SkeletonCircle size="10" />
                  <Skeleton height="10px" width="70%" />
                </Flex>
              ))}
          </Stack>
        ) : (
          communities.map((item, index) => {
            const isJoined = !!communityStateValue.mySnippets.find(
              (snippet) => snippet.communityId === item.id,
            );
            return (
              <RecommendationRow
                key={item.id}
                item={item}
                index={index}
                isJoined={isJoined}
                onJoinOrLeaveCommunity={onJoinOrLeaveCommunity}
              />
            );
          })
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
    </Flex>
  );
};
export default Recommendations;
