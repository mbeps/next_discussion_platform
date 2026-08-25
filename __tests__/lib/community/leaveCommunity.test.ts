import { beforeEach, describe, expect, it, vi } from "vitest";
import { fsMocks, resetFsMocks } from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { leaveCommunity } from "@/lib/community/leaveCommunity";

beforeEach(resetFsMocks);

describe("leaveCommunity", () => {
  it("deletes the user's snippet for the community", async () => {
    await leaveCommunity("u1", "react");
    expect(fsMocks.batch.delete).toHaveBeenCalledWith({
      __docRef: ["users/u1/communitySnippets", "react"],
    });
  });

  it("decrements member count by 1", async () => {
    await leaveCommunity("u1", "react");
    expect(fsMocks.batch.update).toHaveBeenCalledWith(expect.anything(), {
      numberOfMembers: { __increment: -1 },
    });
  });

  it("commits the batch once", async () => {
    await leaveCommunity("u1", "react");
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("propagates batch commit failures", async () => {
    fsMocks.batch.commit.mockRejectedValueOnce(new Error("offline"));
    await expect(leaveCommunity("u1", "react")).rejects.toThrow("offline");
  });
});
