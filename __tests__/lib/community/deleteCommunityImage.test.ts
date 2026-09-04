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

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_s: unknown, path: string) => ({ __storageRef: path })),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

import { deleteObject, ref } from "firebase/storage";
import { deleteCommunityImage } from "@/lib/community/deleteCommunityImage";

beforeEach(resetFsMocks);

describe("deleteCommunityImage", () => {
  it("deletes the storage object and clears the community imageURL", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));

    await deleteCommunityImage("react");

    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      "communities/react/image",
    );
    expect(deleteObject).toHaveBeenCalled();
    expect(fsMocks.updateDoc).toHaveBeenCalledWith(
      { __docRef: ["communities", "react"] },
      { imageURL: "" },
    );
  });

  it("clears imageURL on all matching snippets via batch", async () => {
    const s1 = snap("s1", {});
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([s1]));

    await deleteCommunityImage("react");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(s1.ref, { imageURL: "" });
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("propagates storage deletion failures before touching Firestore", async () => {
    vi.mocked(deleteObject).mockRejectedValueOnce(new Error("no such object"));
    await expect(deleteCommunityImage("react")).rejects.toThrow(
      "no such object",
    );
    expect(fsMocks.updateDoc).not.toHaveBeenCalled();
  });
});
