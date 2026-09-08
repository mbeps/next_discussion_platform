const HOME_BASE = "/" as const;
const COMMUNITIES_BASE = "/communities" as const;
const COMMUNITY_BASE = "/community" as const;

export const ROUTES = {
  HOME: {
    path: HOME_BASE,
  },
  COMMUNITIES: {
    path: COMMUNITIES_BASE,
  },
  COMMUNITY: {
    path: COMMUNITY_BASE,
    detail: (communityId: string) => `${COMMUNITY_BASE}/${communityId}`,
    submit: (communityId: string) => `${COMMUNITY_BASE}/${communityId}/submit`,
    post: (communityId: string, postId?: string) =>
      `${COMMUNITY_BASE}/${communityId}/comments/${postId ?? ""}`,
  },
} as const;

export type Routes = typeof ROUTES;
