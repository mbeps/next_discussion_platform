import { Community } from "@/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const router = useRouter();
  return (
    <Box position="sticky" top="50px">
      <Flex
        justify="space-between"
        align="center"
        bg="red.500"
        color="white"
        p={3}
        borderRadius="10px 10px 0px 0px"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Circus
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>

      <Flex
        direction="column"
        p={3}
        bg="white"
        borderRadius="0px 0px 10px 10px"
      >
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt">
            <Flex direction="column" flexGrow={1}>
              <Text fontWeight={700}>Clowns</Text>
              <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
            </Flex>
            <Flex direction="column" flexGrow={1}>
              <Text fontWeight={700}>Created</Text>
              <Text>{communityData.createdAt && "Not Working :("}</Text>
            </Flex>
          </Flex>
          <Link href={`/community/${router.query.communityId}/submit`}>
            <Button width="100%">Create Post</Button>
          </Link>
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
