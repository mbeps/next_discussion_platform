/// <reference types="vitest" />
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: mocks.create },
}));

import useCustomToast from "@/hooks/useCustomToast";

describe("useCustomToast", () => {
  beforeEach(() => {
    mocks.create.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a stable function reference across re-renders", () => {
    const { result, rerender } = renderHook(() => useCustomToast());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it.each([
    ["success", "success"],
    ["error", "error"],
    ["warning", "warning"],
    ["info", "info"],
  ] as const)("maps status %s to type %s", (status, expectedType) => {
    const { result } = renderHook(() => useCustomToast());
    result.current({ title: "T", status });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "T", type: expectedType }),
    );
  });

  it("always sets closable and duration", () => {
    const { result } = renderHook(() => useCustomToast());
    result.current({ title: "T", status: "info" });
    expect(mocks.create).toHaveBeenCalledWith({
      title: "T",
      description: undefined,
      type: "info",
      closable: true,
      duration: 5000,
    });
  });

  it("passes description through when provided", () => {
    const { result } = renderHook(() => useCustomToast());
    result.current({ title: "T", description: "D", status: "error" });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: "D" }),
    );
  });

  it("swallows errors thrown by toaster.create and logs them", () => {
    mocks.create.mockImplementation(() => {
      throw new Error("boom");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useCustomToast());
    expect(() => result.current({ title: "T", status: "error" })).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith("Toast error:", expect.any(Error));
  });
});
