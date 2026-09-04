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

import { removeCommunityMember } from "@/lib/community/removeCommunityMember";

beforeEach(resetFsMocks);

describe("removeCommunityMember", () => {
  it("deletes the member's snippet and decrements count", async () => {
    await removeCommunityMember("react", "u2");

    expect(fsMocks.batch.delete).toHaveBeenCalledWith({
      __docRef: ["users/u2/communitySnippets", "react"],
    });
    expect(fsMocks.batch.update).toHaveBeenCalledWith(expect.anything(), {
      numberOfMembers: { __increment: -1 },
    });
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("logs and rethrows on failure", async () => {
    fsMocks.batch.commit.mockRejectedValueOnce(new Error("offline"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(removeCommunityMember("react", "u2")).rejects.toThrow(
      "offline",
    );
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
