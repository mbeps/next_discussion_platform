/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  createCommunity: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/",
}));

vi.mock("@/lib/community/createCommunity", () => ({
  createCommunity: mocks.createCommunity,
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.toast,
}));

import { useCreateCommunity } from "@/hooks/community/useCreateCommunity";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

describe("useCreateCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    mocks.createCommunity.mockResolvedValue(undefined);
  });

  it.each([
    ["ab", "Community name must be at least 3 characters long"],
    ["bad!name", "Community name can only contain letters and numbers"],
    ["has space", "Community name can only contain letters and numbers"],
    ["dot.name", "Community name can only contain letters and numbers"],
  ])(
    "rejects %j with validation error and skips backend",
    async (name, expectedError) => {
      const { result } = renderHook(() => useCreateCommunity(), { wrapper });
      let ok!: boolean;
      await act(async () => {
        ok = await result.current.createCommunity(name, "public");
      });
      expect(ok).toBe(false);
      expect(result.current.error).toBe(expectedError);
      expect(mocks.createCommunity).not.toHaveBeenCalled();
      expect(mocks.push).not.toHaveBeenCalled();
    },
  );

  it("accepts a valid name and calls the lib with uid", async () => {
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    let ok!: boolean;
    await act(async () => {
      ok = await result.current.createCommunity("MyComm123", "public");
    });
    expect(ok).toBe(true);
    expect(mocks.createCommunity).toHaveBeenCalledWith(
      "MyComm123",
      "public",
      "u1",
    );
  });

  it("navigates to /community/{name} on success", async () => {
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    await act(async () => {
      await result.current.createCommunity("ValidName", "restricted");
    });
    expect(mocks.push).toHaveBeenCalledWith("/community/ValidName");
  });

  it("clears a previous error on next attempt", async () => {
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    await act(async () => {
      await result.current.createCommunity("x", "public");
    });
    expect(result.current.error).not.toBe("");
    await act(async () => {
      await result.current.createCommunity("GoodName", "public");
    });
    expect(result.current.error).toBe("");
  });

  it("sets error and shows error toast when backend fails", async () => {
    mocks.createCommunity.mockRejectedValue(new Error("taken"));
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    let ok!: boolean;
    await act(async () => {
      ok = await result.current.createCommunity("GoodName", "public");
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe("taken");
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        title: "Community not Created",
      }),
    );
  });

  it("loading toggles during creation", async () => {
    let resolve!: (v: unknown) => void;
    mocks.createCommunity.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    const p = result.current.createCommunity("GoodName", "public");
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolve(undefined);
    });

    await p;

    expect(result.current.loading).toBe(false);
  });

  it("setError is exposed for external clearing", async () => {
    const { result } = renderHook(() => useCreateCommunity(), { wrapper });
    act(() => {
      result.current.setError("manual");
    });
    expect(result.current.error).toBe("manual");
  });
});
