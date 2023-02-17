import PageContent from "@/components/Layout/PageContent";
import NewPostForm from "@/components/Posts/NewPostForm";
import { auth } from "@/firebase/clientApp";
import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const SubmitPostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  return (
    <PageContent>
      <>
        <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
          <Text fontSize="20pt" fontWeight={700} color="black">
            Create Post
          </Text>
        </Box>
        {user && <NewPostForm user={user} />}
      </>
      <>{/* About */}</>
    </PageContent>
  );
};
export default SubmitPostPage;
