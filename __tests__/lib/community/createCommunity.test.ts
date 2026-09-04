import { beforeEach, describe, expect, it, vi } from "vitest";
import { fsMocks, resetFsMocks, snap } from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/firestore", async () => {
  const { fsMocks } = await import("../helpers/firestore-mock");
  return { ...fsMocks };
});

import { createCommunity } from "@/lib/community/createCommunity";

beforeEach(resetFsMocks);

describe("createCommunity", () => {
  it("creates community doc and creator snippet in a transaction", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("react", {}, { exists: false }));

    await createCommunity("react", "public", "u1");

    expect(fsMocks.runTransaction).toHaveBeenCalledTimes(1);
    expect(fsMocks.tx.set).toHaveBeenNthCalledWith(
      1,
      { __docRef: ["communities", "react"] },
      {
        creatorId: "u1",
        createdAt: { __serverTimestamp: true },
        numberOfMembers: 1,
        privacyType: "public",
      },
    );
    expect(fsMocks.tx.set).toHaveBeenNthCalledWith(
      2,
      { __docRef: ["users/u1/communitySnippets", "react"] },
      { communityId: "react", isAdmin: true },
    );
  });

  it("throws when the community name is taken", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("react", { creatorId: "x" }));

    await expect(createCommunity("react", "public", "u1")).rejects.toThrow(
      "Sorry, /r/react is taken. Try another.",
    );
    expect(fsMocks.tx.set).not.toHaveBeenCalled();
  });

  it("propagates the requested privacy type", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("priv", {}, { exists: false }));
    await createCommunity("priv", "private", "u1");
    expect(fsMocks.tx.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ privacyType: "private" }),
    );
  });
});
