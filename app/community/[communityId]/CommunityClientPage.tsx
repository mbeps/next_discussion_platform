"use client";

import { Community, communityStateAtom } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

type CommunityPageProps = {
  communityData: Community;
};

const CommunityClientPage: React.FC<CommunityPageProps> = ({
  communityData,
}) => {
  const setCommunityStateValue = useSetAtom(communityStateAtom);

  useEffect(() => {
    if (communityData) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: communityData,
      }));
    }
  }, [communityData, setCommunityStateValue]);

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

export default CommunityClientPage;
