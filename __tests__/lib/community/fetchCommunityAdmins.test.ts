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

import { fetchCommunityAdmins } from "@/lib/community/fetchCommunityAdmins";

beforeEach(resetFsMocks);

describe("fetchCommunityAdmins", () => {
  it("returns creator plus adminIds, deduplicated", async () => {
    fsMocks.getDoc
      .mockResolvedValueOnce(snap("u1", { email: "a@x.com", displayName: "A" }))
      .mockResolvedValueOnce(
        snap("u2", { email: "b@x.com", displayName: "B" }),
      );

    const admins = await fetchCommunityAdmins("u1", ["u2", "u1"]);

    expect(fsMocks.getDoc).toHaveBeenCalledTimes(2);
    expect(admins).toEqual([
      { uid: "u1", email: "a@x.com", displayName: "A" },
      { uid: "u2", email: "b@x.com", displayName: "B" },
    ]);
  });

  it("skips missing user docs", async () => {
    fsMocks.getDoc
      .mockResolvedValueOnce(snap("u1", {}, { exists: false }))
      .mockResolvedValueOnce(snap("u2", { email: "b@x.com" }));

    const admins = await fetchCommunityAdmins("u1", ["u2"]);
    expect(admins).toEqual([
      { uid: "u2", email: "b@x.com", displayName: undefined },
    ]);
  });

  it("handles undefined adminIds", async () => {
    fsMocks.getDoc.mockResolvedValueOnce(snap("u1", { email: "a@x.com" }));
    const admins = await fetchCommunityAdmins("u1");
    expect(admins).toHaveLength(1);
  });
});
