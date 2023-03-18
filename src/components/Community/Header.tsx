import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { HiArrowCircleUp } from "react-icons/hi";
import useCommunityData from "@/hooks/useCommunityData";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { FiSettings } from "react-icons/fi";
import IconItem from "../atoms/Icon";
import CommunitySettingsModal from "../Modal/CommunitySettings/CommunitySettings";

/**
 * @param {communityData} - data required to be displayed
 */
type HeaderProps = {
  communityData: Community;
};

/**
 * Displays a community header which is responsive.
 * Community header contains:
 *  - Community logo
 *  - Community name
 *  - Subscribe and unsubscribe button
 * @param {communityData} - data required to be displayed
 *
 * @returns {React.FC<HeaderProps>} - Header component
 *
 * @requires CommunityIcon - Displays the community icon.
 * @requires CommunityName - Displays the name of the community.
 * @requires JoinOrLeaveButton - Displays the subscribe and unsubscribe button.
 */
const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const { communityStateValue, onJoinOrLeaveCommunity, loading } =
    useCommunityData();
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  ); // check if the user is already subscribed to the community
  return (
    <Flex direction="column" width="100%" height="120px">
      <Box height="30%" bg="red.500" />
      <Flex justify="center" bg="white" flexGrow={1}>
        <Flex width="95%" maxWidth="1200px" align="center">
          {/* using state instead of fetching from db as no refresh of the page is required */}
          <CommunityIcon
            imageURL={communityStateValue.currentCommunity?.imageURL}
          />

          <Flex padding="10px 16px" width="100%">
            <CommunityName id={communityData.id} />
            <Flex direction="row" flexGrow={1} align="end" justify="end">
              <CommunitySettings communityData={communityData} />
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

/**
 * @param {string} imageURL - URL of the community icon
 */
type CommunityIconProps = {
  imageURL?: string;
};

/**
 * Displays the community icon on the community header.
 * If the community icon is not available, then a default icon is displayed.
 * If the community icon is available, then the community icon is displayed.
 * @param {string} imageURL - URL of the community icon
 * @returns React.FC: Community icon component
 */
const CommunityIcon = ({ imageURL }: CommunityIconProps) => {
  return imageURL ? (
    // if the community icon is available, then display the community icon
    <Image
      src={imageURL}
      borderRadius="full"
      boxSize="66px"
      alt="Community icons"
      color="red.500"
      border="3px solid white"
      shadow="md"
    />
  ) : (
    // if the community icon is not available, then display a default icon
    <Icon
      as={HiArrowCircleUp}
      fontSize={64}
      color="red.500"
      border="3px solid white"
      borderRadius="full"
      bg="white"
      shadow="md"
    />
  );
};

/**
 * @param {string} id - id of the community
 */
type CommunityNameProps = {
  id: string;
};

/**
 * Displays the name of the community on the community header.
 * @param {string} id - id of the community
 * @returns {React.FC<CommunityNameProps>} - displays the name of the community
 */
const CommunityName: React.FC<CommunityNameProps> = ({ id }) => {
  return (
    <Flex direction="column" mr={6}>
      <Text fontWeight={800} fontSize="16pt">
        {id}
      </Text>
    </Flex>
  );
};

/**
 * @param {boolean} isJoined - true if the user is already subscribed to the community
 */
type JoinOrLeaveButtonProps = {
  isJoined: boolean;
  onClick: () => void;
};

/**
 * Button to subscribe or unsubscribe to the community.
 * @param {boolean} isJoined - true if the user is already subscribed to the community
 * @returns
 */
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
      shadow="md"
      width="120px"
    >
      {isJoined ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

type CommunitySettingsProps = {
  communityData: Community;
};

export const CommunitySettings: React.FC<CommunitySettingsProps> = ({
  communityData,
}) => {
  const router = useRouter();
  const { communityId } = router.query;
  const [user] = useAuthState(auth);
  const [isCommunitySettingsModalOpen, setCommunitySettingsModalOpen] =
    useState(false);

  return (
    <>
      {user?.uid === communityData.creatorId && (
        <>
          <CommunitySettingsModal
            open={isCommunitySettingsModalOpen}
            handleClose={() => setCommunitySettingsModalOpen(false)}
            communityData={communityData}
          />
          <IconItem
            icon={FiSettings}
            fontSize={20}
            onClick={() => setCommunitySettingsModalOpen(true)}
            iconColor="gray.500"
          />
        </>
      )}
    </>
  );
};
