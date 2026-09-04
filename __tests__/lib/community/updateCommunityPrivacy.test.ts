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

import { updateCommunityPrivacy } from "@/lib/community/updateCommunityPrivacy";

beforeEach(resetFsMocks);

describe("updateCommunityPrivacy", () => {
  it.each(["public", "restricted", "private"])(
    "persists privacyType %s on the community doc",
    async (privacyType) => {
      await updateCommunityPrivacy("react", privacyType);
      expect(fsMocks.updateDoc).toHaveBeenCalledWith(
        { __docRef: ["communities", "react"] },
        { privacyType },
      );
    },
  );
});
