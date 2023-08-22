import { authModalState } from "@/atoms/authModalAtom";
import About from "@/components/Community/About";
import PageContent from "@/components/Layout/PageContent";
import AuthButtons from "@/components/Navbar/RightContent/AuthButtons";
import NewPostForm from "@/components/Posts/NewPostForm";
import { auth } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import { Box, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

/**
 * Post submission page where the user can create a new post.
 * If the user is not logged in, they will be prompted to log in.
 * Displays:
 * - Post creation form
 * - Community information card
 * @returns {React.FC} - Submit post page component
 */
const SubmitPostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  // const communityStateValue = useRecoilValue(communityState);
  const { communityStateValue } = useCommunityData();
  const setAuthModalState = useSetRecoilState(authModalState);

  return (
    <PageContent>
      <>
        <Box p="14px 0px">
          <Text fontSize="20pt" fontWeight={700} color="black">
            Create Post
          </Text>
        </Box>
        {user ? (
          <NewPostForm
            user={user}
            communityImageURL={communityStateValue.currentCommunity?.imageURL}
            currentCommunity={communityStateValue.currentCommunity}
          />
        ) : (
          <Stack
            justifyContent="center"
            align="center"
            bg="white"
            p={5}
            borderRadius={10}
          >
            <Text fontWeight={600}>Log in or sign up to post</Text>
            <Stack direction="row" spacing={2} ml={4}>
              <AuthButtons />
            </Stack>
          </Stack>
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};
export default SubmitPostPage;
