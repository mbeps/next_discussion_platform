import { Community } from "@/atoms/communitiesAtom";
import { Button, Flex, Icon, Image, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoPeopleCircleOutline } from "react-icons/io5";

/**
 * @param {Community} community - community object
 * @param {boolean} isJoined - whether the user is joined to the community
 * @param {(community: Community, isJoined: boolean) => void} onJoinOrLeaveCommunity - function to join or leave a community
 */
interface CommunityItemProps {
  community: Community;
  isJoined: boolean;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
}

/**
 * Card displaying a community (name and logo) with the subscribe button and the number of members.
 * @param {Community} community - community object
 * @param {boolean} isJoined - whether the user is joined to the community
 * @param {(community: Community, isJoined: boolean) => void} onJoinOrLeaveCommunity - function to join or leave a community
 *
 * @returns {React.FC} - the community item component
 */
const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  isJoined,
  onJoinOrLeaveCommunity,
}) => {
  const router = useRouter();

  return (
    <Flex
      align="center"
      fontSize="10pt"
      borderColor="white"
      borderWidth="1px"
      p="14px 12px"
      borderRadius={10}
      bg="white"
      _hover={{
        borderColor: "gray.500",
      }}
      cursor="pointer"
      onClick={() => {
        router.push(`/community/${community.id}`);
      }}
      shadow="md"
    >
      <Flex width="80%" align="center">
        <Flex align="center">
          {community.imageURL ? (
            <Image
              src={community.imageURL}
              borderRadius="full"
              boxSize="35px"
              mr={4}
              alt="Community Icon"
            />
          ) : (
            <Icon
              as={IoPeopleCircleOutline}
              fontSize={38}
              color="red.500"
              mr={4}
            />
          )}
          <Text fontSize={16}>{community.id}</Text>
        </Flex>
      </Flex>
      <Stack direction="row" align="center">
        <Flex
          fontSize={18}
          color="gray.500"
          justify="center"
          align="center"
          mr={2}
        >
          <Icon as={BsFillPeopleFill} mr={1} />
          {community.numberOfMembers}
        </Flex>
        <Button
          height="30px"
          width="130px"
          fontSize="10pt"
          variant={isJoined ? "outline" : "solid"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation(); // stop the event from bubbling up
            onJoinOrLeaveCommunity(community, isJoined);
          }}
        >
          {isJoined ? "Unsubscribe" : "Subscribe"}
        </Button>
      </Stack>
    </Flex>
  );
};

export default CommunityItem;
