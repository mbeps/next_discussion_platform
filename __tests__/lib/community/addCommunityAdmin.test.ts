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

import { addCommunityAdmin } from "@/lib/community/addCommunityAdmin";

beforeEach(resetFsMocks);

describe("addCommunityAdmin", () => {
  it("adds to adminIds and sets isAdmin on existing snippet", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("react", {}));

    await addCommunityAdmin("react", "u2");

    expect(fsMocks.tx.update).toHaveBeenCalledWith(
      { __docRef: ["communities", "react"] },
      { adminIds: { __arrayUnion: ["u2"] } },
    );
    expect(fsMocks.tx.update).toHaveBeenCalledWith(
      { __docRef: ["users/u2/communitySnippets/react"] },
      { isAdmin: true },
    );
    expect(fsMocks.tx.set).not.toHaveBeenCalled();
  });

  it("creates a snippet and increments members when user is not a member", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("react", {}, { exists: false }));

    await addCommunityAdmin("react", "u2", "http://img");

    expect(fsMocks.tx.set).toHaveBeenCalledWith(
      { __docRef: ["users/u2/communitySnippets/react"] },
      { communityId: "react", imageURL: "http://img", isAdmin: true },
    );
    expect(fsMocks.tx.update).toHaveBeenCalledWith(expect.anything(), {
      numberOfMembers: { __increment: 1 },
    });
  });

  it("falls back to empty imageURL when none provided for new member", async () => {
    fsMocks.tx.get.mockResolvedValueOnce(snap("r", {}, { exists: false }));
    await addCommunityAdmin("r", "u2");
    expect(fsMocks.tx.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ imageURL: "" }),
    );
  });
});
