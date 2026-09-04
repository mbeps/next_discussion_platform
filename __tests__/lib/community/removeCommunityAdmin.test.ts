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

import { removeCommunityAdmin } from "@/lib/community/removeCommunityAdmin";

beforeEach(resetFsMocks);

describe("removeCommunityAdmin", () => {
  it("removes user from adminIds and unsets snippet isAdmin", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("react", {}));

    await removeCommunityAdmin("react", "u2");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["communities", "react"] },
      { adminIds: { __arrayRemove: ["u2"] } },
    );
    expect(fsMocks.batch.update).toHaveBeenCalledWith(
      { __docRef: ["users/u2/communitySnippets/react"] },
      { isAdmin: false },
    );
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("skips snippet update when the snippet does not exist", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("x", {}, { exists: false }));

    await removeCommunityAdmin("react", "ghost");

    expect(fsMocks.batch.update).toHaveBeenCalledTimes(1);
    expect(fsMocks.batch.update).toHaveBeenCalledWith(expect.anything(), {
      adminIds: { __arrayRemove: ["ghost"] },
    });
  });
});
