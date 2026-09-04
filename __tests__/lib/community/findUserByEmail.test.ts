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

import { findUserByEmail } from "@/lib/community/findUserByEmail";

beforeEach(resetFsMocks);

describe("findUserByEmail", () => {
  it("returns the first matching user", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(
      querySnap([snap("u1", { email: "a@x.com" })]),
    );
    const user = await findUserByEmail("a@x.com");
    expect(user).toEqual({ uid: "u1", email: "a@x.com" });
  });

  it("returns null when no user matches", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    expect(await findUserByEmail("nobody@x.com")).toBeNull();
  });

  it("queries users by exact email equality", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await findUserByEmail("a@x.com");
    const q = fsMocks.getDocs.mock.calls[0][0];
    expect(q.__query.slice(1)).toContainEqual({
      kind: "where",
      field: "email",
      op: "==",
      value: "a@x.com",
    });
  });
});
