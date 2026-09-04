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

import { getCommunityData } from "@/lib/community/getCommunityData";

beforeEach(resetFsMocks);

describe("getCommunityData", () => {
  it("returns serialized community when found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(
      snap("react", { numberOfMembers: 5, privacyType: "public" }),
    );
    const result = await getCommunityData("react");
    expect(result).toEqual({
      id: "react",
      numberOfMembers: 5,
      privacyType: "public",
    });
  });

  it("returns null when not found", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("x", {}, { exists: false }));
    expect(await getCommunityData("x")).toBeNull();
  });

  it("throws (after logging) when the fetch fails", async () => {
    fsMocks.getDoc.mockRejectedValueOnce(new Error("offline"));
    vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(getCommunityData("react")).rejects.toThrow("offline");
    vi.restoreAllMocks();
  });
});
