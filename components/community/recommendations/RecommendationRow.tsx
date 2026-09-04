import { Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import Link from "next/link";
import type React from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";
import type { Community } from "@/types/community";

type RecommendationRowProps = {
  item: Community;
  index: number;
  isJoined: boolean;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
};

/**
 * Single recommendation row showing rank, avatar, and join/leave action.
 * @param item - Community to render.
 * @param index - Position in the recommendation list for ranking.
 * @param isJoined - Whether the viewer is subscribed.
 * @param onJoinOrLeaveCommunity - Callback to toggle membership.
 * @returns Link-wrapped row with action button.
 */
const RecommendationRow: React.FC<RecommendationRowProps> = ({
  item,
  index,
  isJoined,
  onJoinOrLeaveCommunity,
}) => {
  return (
    <Link key={item.id} href={`/community/${item.id}`}>
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
};

export default RecommendationRow;
