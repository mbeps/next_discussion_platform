import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fsMocks,
  querySnap,
  resetFsMocks,
  snap,
} from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { joinCommunity } from "@/lib/community/joinCommunity";

beforeEach(resetFsMocks);

describe("joinCommunity", () => {
  it("sets a snippet with imageURL and isAdmin flag", async () => {
    const snippet = await joinCommunity("u1", "react", "http://img", true);

    expect(snippet).toEqual({
      communityId: "react",
      imageURL: "http://img",
      isAdmin: true,
    });
    expect(fsMocks.batch.set).toHaveBeenCalledWith(
      { __docRef: ["users/u1/communitySnippets", "react"] },
      snippet,
    );
  });

  it("falls back to empty string when imageURL is falsy", async () => {
    const snippet = await joinCommunity("u1", "react", "", false);
    expect(snippet.imageURL).toBe("");
    expect(snippet.isAdmin).toBe(false);
  });

  it("increments member count by 1", async () => {
    await joinCommunity("u1", "react", "", false);
    expect(fsMocks.batch.update).toHaveBeenCalledWith(expect.anything(), {
      numberOfMembers: { __increment: 1 },
    });
  });

  it("commits the batch once", async () => {
    await joinCommunity("u1", "react", "", false);
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });
});
