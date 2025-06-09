"use client";
import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";

interface CommunityPageClientProps {
  communityData?: Community;
}

const CommunityPageClient: React.FC<CommunityPageClientProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);

  useEffect(() => {
    if (communityData) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: communityData,
      }));
    }
  }, [communityData, setCommunityStateValue]);

  if (!communityData || Object.keys(communityData).length === 0) {
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
export default CommunityPageClient;
