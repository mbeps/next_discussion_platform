import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";
import { HiArrowCircleUp } from "react-icons/hi";

type HeaderProps = {
  communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const isJoined = false; // todo: will check database
  return (
    <Flex direction="column" width="100%" height="120px">
      <Box height="50%" bg="red.500" />
      <Flex justify="center" bg="white" flexGrow={1}>
        <Flex width="95%" maxWidth="860px" align="center">
          {communityData.imageURL ? (
            // If community has image then display the image
            <Image />
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
              onClick={() => {
                console.log("Subscribe");
              }}
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
