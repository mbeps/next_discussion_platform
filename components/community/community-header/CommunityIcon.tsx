import { Icon, Image } from "@chakra-ui/react";
import type React from "react";
import { HiArrowCircleUp } from "react-icons/hi";

type CommunityIconProps = {
  imageURL?: string;
};

/**
 * Renders the community avatar or a default icon.
 * @param imageURL - Optional community image url.
 * @returns Circle avatar image or fallback glyph.
 */
const CommunityIcon: React.FC<CommunityIconProps> = ({ imageURL }) => {
  return imageURL ? (
    <Image
      src={imageURL}
      borderRadius="full"
      boxSize="66px"
      alt="Community icons"
      color="red.500"
      border="3px solid"
      borderColor={{ base: "white", _dark: "gray.800" }}
      shadow="md"
    />
  ) : (
    <Icon
      as={HiArrowCircleUp}
      fontSize={64}
      color="red.500"
      border="3px solid"
      borderColor={{ base: "white", _dark: "gray.800" }}
      borderRadius="full"
      bg={{ base: "white", _dark: "gray.800" }}
      shadow="md"
    />
  );
};

export default CommunityIcon;
