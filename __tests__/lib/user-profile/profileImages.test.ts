import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetFsMocks } from "../helpers/firestore-mock";

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_s: unknown, path: string) => ({ __storageRef: path })),
  uploadString: vi.fn().mockResolvedValue(undefined),
  getDownloadURL: vi.fn().mockResolvedValue("http://avatar"),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

import { uploadProfileImage } from "@/lib/user-profile/uploadProfileImage";
import { deleteProfileImage } from "@/lib/user-profile/deleteProfileImage";
import {
  getDownloadURL,
  ref,
  uploadString,
  deleteObject,
} from "firebase/storage";

beforeEach(resetFsMocks);

describe("uploadProfileImage", () => {
  it("uploads as data_url at users/{uid}/profileImage and returns URL", async () => {
    const url = await uploadProfileImage("u1", "data:image/png;base64,abc");

    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      "users/u1/profileImage",
    );
    expect(uploadString).toHaveBeenCalledWith(
      expect.anything(),
      "data:image/png;base64,abc",
      "data_url",
    );
    expect(url).toBe("http://avatar");
  });

  it("propagates upload failures", async () => {
    vi.mocked(uploadString).mockRejectedValueOnce(new Error("quota"));
    await expect(uploadProfileImage("u1", "x")).rejects.toThrow("quota");
  });
});

describe("deleteProfileImage", () => {
  it("deletes the object at users/{uid}/profileImage", async () => {
    await deleteProfileImage("u1");
    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      "users/u1/profileImage",
    );
    expect(deleteObject).toHaveBeenCalledTimes(1);
  });

  it("propagates deletion failures", async () => {
    vi.mocked(deleteObject).mockRejectedValueOnce(new Error("not found"));
    await expect(deleteProfileImage("u1")).rejects.toThrow("not found");
  });
});
