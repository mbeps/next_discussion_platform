import { beforeEach, describe, expect, it, vi } from "vitest";
import { fsMocks, resetFsMocks } from "../helpers/firestore-mock";

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
  getDownloadURL: vi.fn().mockResolvedValue("http://post-img"),
}));

import { createPost } from "@/lib/posts/createPost";

import type { User } from "firebase/auth";

const userObj = {
  uid: "u1",
  email: "jane@x.com",
  displayName: "Jane",
};
const user = userObj as unknown as User;

beforeEach(resetFsMocks);

describe("createPost", () => {
  it("creates a post doc with defaults and returns its id", async () => {
    const id = await createPost(user, "react", "http://cimg", {
      title: "Hello",
      body: "World",
    });

    expect(id).toBe("new-doc-id");
    expect(fsMocks.addDoc).toHaveBeenCalledWith(
      { __collection: ["posts"] },
      {
        communityId: "react",
        communityImageURL: "http://cimg",
        creatorId: "u1",
        creatorUsername: "Jane",
        title: "Hello",
        body: "World",
        numberOfComments: 0,
        voteStatus: 0,
        createTime: { __serverTimestamp: true },
      },
    );
  });

  it("falls back to email prefix when no displayName and empty imageURL", async () => {
    await createPost(
      { ...userObj, displayName: null } as unknown as User,
      "react",
      undefined,
      {
        title: "T",
        body: "",
      },
    );

    expect(fsMocks.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        creatorUsername: "jane",
        communityImageURL: "",
      }),
    );
  });

  it("uploads image and patches imageURL when selectedFile given", async () => {
    const { updateDoc } = await import("firebase/firestore");
    const { uploadString } = await import("firebase/storage");

    await createPost(user, "react", "", { title: "T", body: "" }, "data:img");

    expect(uploadString).toHaveBeenCalledWith(
      expect.anything(),
      "data:img",
      "data_url",
    );
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      imageURL: "http://post-img",
    });
  });

  it("skips storage when no file provided", async () => {
    const { uploadString } = await import("firebase/storage");
    await createPost(user, "react", "", { title: "T", body: "" });
    expect(uploadString).not.toHaveBeenCalled();
  });
});
