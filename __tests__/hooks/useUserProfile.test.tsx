/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  useUpdateProfile: vi.fn(),
  uploadProfileImage: vi.fn(),
  deleteProfileImage: vi.fn(),
  updateUserCommentsName: vi.fn(),
  updateUserPostsName: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
  useUpdateProfile: mocks.useUpdateProfile,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
}));

vi.mock("@/lib/user-profile/uploadProfileImage", () => ({
  uploadProfileImage: mocks.uploadProfileImage,
}));
vi.mock("@/lib/user-profile/deleteProfileImage", () => ({
  deleteProfileImage: mocks.deleteProfileImage,
}));
vi.mock("@/lib/user-profile/updateUserCommentsName", () => ({
  updateUserCommentsName: mocks.updateUserCommentsName,
}));
vi.mock("@/lib/user-profile/updateUserPostsName", () => ({
  updateUserPostsName: mocks.updateUserPostsName,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mocks.showToast,
}));

import useUserProfile from "@/hooks/useUserProfile";

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

const user = () => ({
  uid: "u1",
  reload: vi.fn().mockResolvedValue(undefined),
});

const happyAuth = (u = user()) => {
  mocks.useAuthState.mockReturnValue([u, false, undefined]);
  mocks.useUpdateProfile.mockReturnValue([
    vi.fn().mockResolvedValue(true),
    false,
    undefined,
  ]);
  return u;
};

describe("useUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.uploadProfileImage.mockResolvedValue("https://cdn/pic.png");
    mocks.deleteProfileImage.mockResolvedValue(undefined);
    mocks.updateUserCommentsName.mockResolvedValue(undefined);
    mocks.updateUserPostsName.mockResolvedValue(undefined);
  });

  it("returns update functions and a combined loading flag", () => {
    happyAuth();
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    expect(result.current).toMatchObject({
      updateImage: expect.any(Function),
      removeImage: expect.any(Function),
      updateName: expect.any(Function),
      loading: false,
    });
  });

  it("updateImage uploads, updates profile, reloads and toasts success", async () => {
    const u = happyAuth();
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateImage("data:image");
    });
    expect(ok).toBe(true);
    expect(mocks.uploadProfileImage).toHaveBeenCalledWith("u1", "data:image");
    expect(u.reload).toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalled();
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Profile updated", status: "success" }),
    );
  });

  it("updateImage reports loading while uploading", async () => {
    let resolveUpload!: (v: string) => void;
    mocks.uploadProfileImage.mockReturnValue(
      new Promise<string>((r) => (resolveUpload = r)),
    );
    happyAuth();
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let promise!: Promise<boolean | undefined>;
    act(() => {
      promise = result.current.updateImage("data:image");
    });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      resolveUpload("url");
      await promise;
    });
    expect(result.current.loading).toBe(false);
  });

  it("updateImage returns false and toasts error when upload fails", async () => {
    happyAuth();
    mocks.uploadProfileImage.mockRejectedValue(new Error("storage down"));
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateImage("data:image");
    });
    expect(ok).toBe(false);
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Image not Updated", status: "error" }),
    );
  });

  it("updateImage returns false when updateProfile fails", async () => {
    happyAuth();
    mocks.useUpdateProfile.mockReturnValue([
      vi.fn().mockResolvedValue(false),
      false,
      undefined,
    ]);
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateImage("data:image");
    });
    expect(ok).toBe(false);
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("updateImage does nothing without a user", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    mocks.useUpdateProfile.mockReturnValue([vi.fn(), false, undefined]);
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateImage("data:image");
    });
    expect(ok).toBeUndefined();
    expect(mocks.uploadProfileImage).not.toHaveBeenCalled();
  });

  it("removeImage deletes image, updates profile and toasts success", async () => {
    const u = happyAuth();
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.removeImage();
    });
    expect(ok).toBe(true);
    expect(mocks.deleteProfileImage).toHaveBeenCalledWith("u1");
    expect(u.reload).toHaveBeenCalled();
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Profile updated", status: "success" }),
    );
  });

  it("removeImage returns false and toasts error on failure", async () => {
    happyAuth();
    mocks.deleteProfileImage.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.removeImage();
    });
    expect(ok).toBe(false);
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Image not Deleted", status: "error" }),
    );
  });

  it("removeImage does nothing without a user", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    mocks.useUpdateProfile.mockReturnValue([vi.fn(), false, undefined]);
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await act(async () => {
      await result.current.removeImage();
    });
    expect(mocks.deleteProfileImage).not.toHaveBeenCalled();
  });

  it("updateName updates profile then syncs comments and posts names", async () => {
    const u = happyAuth();
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateName("New Name");
    });
    expect(ok).toBe(true);
    expect(mocks.updateUserCommentsName).toHaveBeenCalledWith("u1", "New Name");
    expect(mocks.updateUserPostsName).toHaveBeenCalledWith("u1", "New Name");
    expect(u.reload).toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("updateName does not sync posts/comments when updateProfile fails", async () => {
    happyAuth();
    mocks.useUpdateProfile.mockReturnValue([
      vi.fn().mockResolvedValue(false),
      false,
      undefined,
    ]);
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateName("X");
    });
    expect(ok).toBe(false);
    expect(mocks.updateUserCommentsName).not.toHaveBeenCalled();
    expect(mocks.updateUserPostsName).not.toHaveBeenCalled();
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Name not Updated", status: "error" }),
    );
  });

  it("updateName toasts error when syncing posts fails", async () => {
    happyAuth();
    mocks.updateUserPostsName.mockRejectedValue(new Error("firestore"));
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateName("X");
    });
    expect(ok).toBe(false);
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });

  it("updateName does nothing without a user", async () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    mocks.useUpdateProfile.mockReturnValue([vi.fn(), false, undefined]);
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    await act(async () => {
      await result.current.updateName("X");
    });
    expect(mocks.updateUserCommentsName).not.toHaveBeenCalled();
  });
});
