/// <reference types="vitest" />

import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

import useSelectFile from "@/hooks/useSelectFile";

const mockToast = vi.fn();

vi.mock("@/hooks/useCustomToast", () => ({
  __esModule: true,
  default: () => mockToast,
}));

const originalImage = global.Image;
const originalCreateObjectURL = global.URL.createObjectURL;
const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
const originalGetContext = HTMLCanvasElement.prototype.getContext;

let mockWidth = 100;
let mockHeight = 100;

class MockImage {
  onload: (() => void) | null = null;
  width = mockWidth;
  height = mockHeight;

  constructor() {
    this.width = mockWidth;
    this.height = mockHeight;
  }

  set src(_value: string) {
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
}

const createFile = (sizeInMb: number, type: string) =>
  new File([new Uint8Array(sizeInMb * 1024 * 1024)], "upload", { type });

const createChangeEvent = (file: File): React.ChangeEvent<HTMLInputElement> =>
  ({
    target: { files: [file] },
  }) as unknown as React.ChangeEvent<HTMLInputElement>;

describe("useSelectFile", () => {
  beforeAll(() => {
    vi.spyOn(global.URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.stubGlobal("Image", MockImage as any);
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = vi
      .fn()
      .mockReturnValue("data:image/jpeg;base64,mocked");
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    (global as unknown as { Image: typeof Image }).Image = originalImage;
    global.URL.createObjectURL = originalCreateObjectURL;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  });

  beforeEach(() => {
    mockToast.mockClear();
    mockWidth = 100;
    mockHeight = 100;
  });

  it("rejects files that exceed the size limit", async () => {
    const { result } = renderHook(() => useSelectFile(300, 300));
    const largeFile = createFile(11, "image/png");

    await act(async () => {
      result.current.onSelectFile(createChangeEvent(largeFile));
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "File size is too large",
      description: "Maximum file size is 10MB.",
      status: "error",
    });
    expect(result.current.selectedFile).toBeUndefined();
  });

  it("rejects files with unsupported types", async () => {
    const { result } = renderHook(() => useSelectFile(300, 300));
    const badFile = createFile(1, "application/pdf");

    await act(async () => {
      result.current.onSelectFile(createChangeEvent(badFile));
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "File type not allowed",
      description: "Only image file types are allowed (.png / .jpeg / .gif).",
      status: "error",
    });
    expect(result.current.selectedFile).toBeUndefined();
  });

  it("rejects images that exceed allowed dimensions", async () => {
    mockWidth = 700;
    mockHeight = 700;

    const { result } = renderHook(() => useSelectFile(500, 500));
    const tallImage = createFile(1, "image/png");

    await act(async () => {
      result.current.onSelectFile(createChangeEvent(tallImage));
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        title: "Image dimensions are too large",
        description: "Maximum dimensions are 500x500.",
        status: "error",
      }),
    );
    expect(result.current.selectedFile).toBeUndefined();
  });

  it("ignores events without a file", async () => {
    const { result } = renderHook(() => useSelectFile(500, 500));

    await act(async () => {
      result.current.onSelectFile({ target: { files: [] } } as any);
    });

    expect(mockToast).not.toHaveBeenCalled();
    expect(result.current.selectedFile).toBeUndefined();
  });

  it("sets the selected file for valid images", async () => {
    mockWidth = 250;
    mockHeight = 250;

    const { result } = renderHook(() => useSelectFile(500, 500));
    const validFile = createFile(1, "image/jpeg");

    await act(async () => {
      result.current.onSelectFile(createChangeEvent(validFile));
    });

    await waitFor(() =>
      expect(result.current.selectedFile).toBe("data:image/jpeg;base64,mocked"),
    );
    expect(mockToast).not.toHaveBeenCalled();
  });
});
