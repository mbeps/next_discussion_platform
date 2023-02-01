import { Community } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React from "react";
import safeJsonStringift from "safe-json-stringify";

type CommunityPageProps = {
  communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  return <div>Welcome to {communityData.id}</div>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get the community data and pass it to client
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);

    return {
      props: {
        communityData: JSON.parse(
          safeJsonStringift({
            id: communityDoc.id,
            ...communityDoc.data(),
          })
        ),
      },
    };
  } catch (error) {
    // todo: add error page
    console.log("Error: getServerSideProps", error);
  }
}

export default CommunityPage;
