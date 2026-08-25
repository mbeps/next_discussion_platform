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

import { getCommunities } from "@/lib/community/getCommunities";

beforeEach(resetFsMocks);

describe("getCommunities", () => {
  it("returns mapped communities and a cursor for a first page", async () => {
    const last = snap("c2", { numberOfMembers: 3 });
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("c1", { numberOfMembers: 9 }), last]),
    );

    const { communities, newLastVisible } = await getCommunities(10);

    expect(communities).toEqual([
      { id: "c1", numberOfMembers: 9 },
      { id: "c2", numberOfMembers: 3 },
    ]);
    expect(newLastVisible).toBe(last);
  });

  it("returns null cursor on empty page", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    const { communities, newLastVisible } = await getCommunities(10);
    expect(communities).toEqual([]);
    expect(newLastVisible).toBeNull();
  });

  it("passes the limit through to the query", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await getCommunities(25);
    // the query's last constraint should be limit(25)
    const q = fsMocks.getDocs.mock.calls[0][0];
    const constraints = q.__query.slice(1);
    expect(constraints).toContainEqual({ kind: "limit", n: 25 });
  });
});
