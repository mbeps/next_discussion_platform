import { Flex, Text } from "@chakra-ui/react";
import moment from "moment";
import type React from "react";
import type { Community } from "@/types/community";

interface AboutCommunityProps {
  communityData: Community;
}

/**
 * Displays community stats for the about card.
 * @param communityData - Community metadata including member count and createdAt.
 * @returns Two-column row showing subscribers and creation date.
 */
const AboutCommunity: React.FC<AboutCommunityProps> = ({ communityData }) => (
  <Flex width="100%" p={2} fontSize="10pt">
    <Flex direction="column" flexGrow={1}>
      <Text fontWeight={700}>Subscribers</Text>
      <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
    </Flex>

    <Flex direction="column" flexGrow={1}>
      <Text fontWeight={700}>Created</Text>
      <Text>
        {communityData.createdAt &&
          moment(new Date(communityData.createdAt.seconds * 1000)).format(
            "MMM DD, YYYY",
          )}
      </Text>
    </Flex>
  </Flex>
);

export default AboutCommunity;
