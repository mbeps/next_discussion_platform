import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";

/**
 * @param {Community} communityData - Community data for the current community
 */
type CommunityPageProps = {
  communityData: Community;
};

/**
 * Displays the community page with the community's posts and information.
 * @param {Community} communityData - Community data for the current community
 * @returns {React.FC<CommunityPageProps>} - Community page component
 */
const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);

  // store the community data currently available into the state as soon as the component renders
  useEffect(() => {
    if (communityData) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: communityData,
      }));
    }
  }, [communityData, setCommunityStateValue]);

  if (!communityData || Object.keys(communityData).length === 0) {
    //  if community data is not available or empty, return not found page
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  );
};

/**
 * Gets the community data for the current community.
 * Returns the community data as props to the client.
 * @param {GetServerSidePropsContext} context - GetServerSidePropsContext object
 * @returns {Promise<{props: {communityData: Community}}>} - Community data for the current community
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get the community data and pass it to the client
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);

    if (!communityDoc.exists()) {
      // if the document does not exist, return notFound property
      return { props: {} };
    }

    return {
      props: {
        communityData: JSON.parse(
          safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
        ),
      },
    };
  } catch (error) {
    // todo: add error page
    console.log("Error: getServerSideProps", error);
    return { props: {} };
  }
}

export default CommunityPage;
