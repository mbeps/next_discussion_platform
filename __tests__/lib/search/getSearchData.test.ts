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

import { getSearchData } from "@/lib/search/getSearchData";

beforeEach(resetFsMocks);

describe("getSearchData", () => {
  it("returns public communities and recent posts", async () => {
    fsMocks.getDocs
      .mockResolvedValueOnce(querySnap([snap("c1", { privacyType: "public" })]))
      .mockResolvedValueOnce(querySnap([snap("p1", { title: "T" })]));

    const { communities, posts } = await getSearchData();

    expect(communities).toEqual([{ id: "c1", privacyType: "public" }]);
    expect(posts).toEqual([{ id: "p1", title: "T" }]);
  });

  it("filters communities to public only", async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]));
    await getSearchData();

    const communitiesQ = fsMocks.getDocs.mock.calls[0][0];
    expect(communitiesQ.__query[0]).toEqual({ __collection: ["communities"] });
    expect(communitiesQ.__query.slice(1)).toContainEqual({
      kind: "where",
      field: "privacyType",
      op: "==",
      value: "public",
    });
  });

  it("limits posts to the 100 most recent by createTime desc", async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]));
    await getSearchData();

    const postsQ = fsMocks.getDocs.mock.calls[1][0];
    expect(postsQ.__query[0]).toEqual({ __collection: ["posts"] });
    expect(postsQ.__query.slice(1)).toEqual([
      { kind: "orderBy", field: "createTime", dir: "desc" },
      { kind: "limit", n: 100 },
    ]);
  });

  it("returns empty arrays when there is no data", async () => {
    fsMocks.getDocs.mockResolvedValue(querySnap([]));
    const { communities, posts } = await getSearchData();
    expect(communities).toEqual([]);
    expect(posts).toEqual([]);
  });
});
