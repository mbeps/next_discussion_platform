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

import { searchUsersByEmail } from "@/lib/community/searchUsersByEmail";

beforeEach(resetFsMocks);

describe("searchUsersByEmail", () => {
  it("returns [] for queries shorter than 3 chars without querying", async () => {
    expect(await searchUsersByEmail("ab")).toEqual([]);
    expect(fsMocks.getDocs).not.toHaveBeenCalled();
  });

  it("runs a range query for the prefix and maps results", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("u1", { email: "ali@x.com" })]),
    );
    const users = await searchUsersByEmail("ali");
    expect(users).toEqual([{ uid: "u1", email: "ali@x.com" }]);

    const q = fsMocks.getDocs.mock.calls[0][0];
    const constraints = q.__query.slice(1);
    expect(constraints).toContainEqual({
      kind: "where",
      field: "email",
      op: ">=",
      value: "ali",
    });
    expect(constraints).toContainEqual({
      kind: "where",
      field: "email",
      op: "<=",
      value: "ali\uf8ff",
    });
  });

  it("limits results to 5", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await searchUsersByEmail("ali");
    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query.slice(1)).toContainEqual({ kind: "limit", n: 5 });
  });

  it("returns empty array when nothing matches", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    expect(await searchUsersByEmail("zzz")).toEqual([]);
  });
});
