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
  uploadString: vi.fn().mockResolvedValue(undefined),
  getDownloadURL: vi.fn().mockResolvedValue("http://new-url"),
}));

import { updateCommunityImage } from "@/lib/community/updateCommunityImage";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

beforeEach(resetFsMocks);

describe("updateCommunityImage", () => {
  it("uploads as data_url and returns the download URL", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));

    const url = await updateCommunityImage("react", "data:image/png;base64,x");

    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      "communities/react/image",
    );
    expect(uploadString).toHaveBeenCalledWith(
      expect.anything(),
      "data:image/png;base64,x",
      "data_url",
    );
    expect(url).toBe("http://new-url");
  });

  it("persists the URL on the community doc", async () => {
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([]));
    await updateCommunityImage("react", "x");
    expect(fsMocks.updateDoc).toHaveBeenCalledWith(
      { __docRef: ["communities", "react"] },
      { imageURL: "http://new-url" },
    );
  });

  it("updates every matching snippet's imageURL in a batch", async () => {
    const s1 = snap("s1", {});
    const s2 = snap("s2", {});
    fsMocks.getDocs.mockResolvedValueOnce(querySnap([s1, s2]));

    await updateCommunityImage("react", "x");

    expect(fsMocks.batch.update).toHaveBeenCalledWith(s1.ref, {
      imageURL: "http://new-url",
    });
    expect(fsMocks.batch.update).toHaveBeenCalledWith(s2.ref, {
      imageURL: "http://new-url",
    });
    expect(fsMocks.batch.commit).toHaveBeenCalledTimes(1);
  });

  it("propagates upload failures", async () => {
    vi.mocked(getDownloadURL).mockRejectedValueOnce(new Error("storage down"));
    await expect(updateCommunityImage("react", "x")).rejects.toThrow(
      "storage down",
    );
  });
});
