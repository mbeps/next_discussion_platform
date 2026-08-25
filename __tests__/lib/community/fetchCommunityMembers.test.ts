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

import { fetchCommunityMembers } from "@/lib/community/fetchCommunityMembers";

beforeEach(resetFsMocks);

describe("fetchCommunityMembers", () => {
  it("maps users with a snippet into members", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([
        snap("u1", { email: "a@x.com", displayName: "Alice" }),
        snap("u2", { email: "b@x.com" }),
      ]),
    );
    fsMocks.getDoc
      .mockResolvedValueOnce(snap("react", {})) // u1 has snippet
      .mockResolvedValueOnce(snap("x", {}, { exists: false })); // u2 doesn't

    const members = await fetchCommunityMembers("react");

    expect(members).toEqual([
      { uid: "u1", email: "a@x.com", displayName: "Alice" },
    ]);
  });

  it("sorts members alphabetically by display name or email", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([
        snap("u1", { email: "z@x.com", displayName: null }),
        snap("u2", { email: "a@x.com", displayName: "Bob" }),
        snap("u3", { email: "m@x.com", displayName: "alice" }),
      ]),
    );
    fsMocks.getDoc.mockResolvedValue(snap("react", {}));

    const members = await fetchCommunityMembers("react");
    expect(members.map((m) => m.uid)).toEqual(["u3", "u2", "u1"]);
  });

  it("falls back to 'Unknown email' when missing", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([snap("u1", {})]));
    fsMocks.getDoc.mockResolvedValueOnce(snap("react", {}));
    const members = await fetchCommunityMembers("react");
    expect(members[0].email).toBe("Unknown email");
    expect(members[0].displayName).toBeNull();
  });

  it("returns empty array when no user has a snippet", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([snap("u1", {})]));
    fsMocks.getDoc.mockResolvedValueOnce(snap("x", {}, { exists: false }));
    expect(await fetchCommunityMembers("react")).toEqual([]);
  });
});
