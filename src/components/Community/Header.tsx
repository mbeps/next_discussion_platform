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
        <Flex width="95%" maxWidth="1200px" align="center">
          {/* using state instead of fetching from db as no refresh of the page is required */}
          <CommunityIcon
            imageURL={communityStateValue.currentCommunity?.imageURL}
          />

          <Flex padding="10px 16px" width="100%" border="1px solid green">
            <CommunityName id={communityData.id} />
            <Flex
              direction="column"
              flexGrow={1}
              align="end"
              justify="end"
              border="1px solid blue"
            >
              <JoinOrLeaveButton
                isJoined={isJoined}
                onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;

type CommunityIconProps = {
  imageURL?: string;
};

const CommunityIcon = ({ imageURL }: CommunityIconProps) => {
  return imageURL ? (
    <Image
      src={imageURL}
      borderRadius="full"
      boxSize="66px"
      alt="Community icons"
      color="red.500"
      border="3px solid white"
    />
  ) : (
    <Icon
      as={HiArrowCircleUp}
      fontSize={64}
      color="red.500"
      border="3px solid white"
      borderRadius="full"
      bg="white"
    />
  );
};

type CommunityNameProps = {
  id: string;
};

const CommunityName: React.FC<CommunityNameProps> = ({ id }) => {
  return (
    <Flex direction="column" mr={6}>
      <Text fontWeight={800} fontSize="16pt">
        {id}
      </Text>
    </Flex>
  );
};

type JoinOrLeaveButtonProps = {
  isJoined: boolean;
  onClick: () => void;
};

export const JoinOrLeaveButton: React.FC<JoinOrLeaveButtonProps> = ({
  isJoined,
  onClick,
}) => {
  return (
    <Button
      variant={isJoined ? "outline" : "solid"}
      height="30px"
      pr={{ base: 2, md: 6 }}
      pl={{ base: 2, md: 6 }}
      onClick={onClick}
    >
      {isJoined ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};
