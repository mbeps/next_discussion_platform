/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchUsersByEmail: vi.fn(),
  findUserByEmail: vi.fn(),
}));

vi.mock("@/lib/community/searchUsersByEmail", () => ({
  searchUsersByEmail: mocks.searchUsersByEmail,
}));

vi.mock("@/lib/community/findUserByEmail", () => ({
  findUserByEmail: mocks.findUserByEmail,
}));

import useAdminSearch from "@/hooks/admin/useAdminSearch";

describe("useAdminSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchUsers", () => {
    it("returns results from the lib", async () => {
      const users = [{ uid: "u1", email: "a@x.com" }];
      mocks.searchUsersByEmail.mockResolvedValue(users);
      const { result } = renderHook(() => useAdminSearch());
      let out!: unknown;
      await act(async () => {
        out = await result.current.searchUsers("a@");
      });
      expect(mocks.searchUsersByEmail).toHaveBeenCalledWith("a@");
      expect(out).toEqual(users);
    });

    it("returns an empty array on failure instead of throwing", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.searchUsersByEmail.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useAdminSearch());
      let out!: unknown;
      await act(async () => {
        out = await result.current.searchUsers("a@");
      });
      expect(out).toEqual([]);
      vi.restoreAllMocks();
    });
  });

  describe("findUser", () => {
    it("returns the found user", async () => {
      const user = { uid: "u1", email: "a@x.com" };
      mocks.findUserByEmail.mockResolvedValue(user);
      const { result } = renderHook(() => useAdminSearch());
      let out!: unknown;
      await act(async () => {
        out = await result.current.findUser("a@x.com");
      });
      expect(mocks.findUserByEmail).toHaveBeenCalledWith("a@x.com");
      expect(out).toEqual(user);
    });

    it("rethrows on failure", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.findUserByEmail.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useAdminSearch());
      await expect(
        act(async () => {
          await result.current.findUser("a@x.com");
        }),
      ).rejects.toThrow("boom");
      vi.restoreAllMocks();
    });
  });
});
