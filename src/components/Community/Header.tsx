import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";
import { HiArrowCircleUp } from "react-icons/hi";
import useCommunityData from "@/hooks/useCommunityData";

type HeaderProps = {
  communityData: Community;
};

/**
 * Displays a community header which is responsive.
 * Community header contains:
 *    - Community logo
 *    - Community name
 *    - Subscribe and unsubscribe button
 * @param {communityData}
 * @returns (React.FC) - header component
 */
const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const { communityStateValue, onJoinOrLeaveCommunity, loading } =
    useCommunityData();
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  );
  return (
    <Flex direction="column" width="100%" height="120px">
      <Box height="30%" bg="red.500" />
      <Flex justify="center" bg="white" flexGrow={1}>
        <Flex width="95%" maxWidth="860px" align="center">
          {/* using state instead of fetching from db as no refresh of the page is required */}
          {communityStateValue.currentCommunity?.imageURL ? (
            // If community has image then display the image
            <Image
              src={communityStateValue.currentCommunity.imageURL}
              borderRadius="full"
              boxSize="66px"
              alt="Community icons"
              color="red.500"
              border="3px solid white"
            />
          ) : (
            // If the community has no image, show this default preset one
            <Icon
              as={HiArrowCircleUp}
              fontSize={64}
              color="red.500"
              border="3px solid white"
              borderRadius="full"
              bg="white"
            />
          )}

          <Flex padding="10px 16px">
            <Flex direction="column" mr={6}>
              <Text fontWeight={800} fontSize="16pt">
                {communityData.id}
              </Text>
            </Flex>
            <Button
              variant={isJoined ? "outline" : "solid"}
              height="30px"
              pr={6}
              pl={6}
              isLoading={loading}
              onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
            >
              {isJoined ? "Unsubscribe" : "Subscribe"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;
