import { vi } from "vitest";

/**
 * Shared Firestore mock surface. Import into a test file and wire it up with:
 *
 *   vi.mock("firebase/firestore", async () => {
 *     const { fsMocks } = await import("./helpers/firestore-mock");
 *     return { ...fsMocks };
 *   });
 *   vi.mock("@/firebase/clientApp", () => ({
 *     auth: {},
 *     firestore: {},
 *     storage: {},
 *   }));
 */

export const fsMocks = {
  batch: {
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  },
  tx: {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Drop the leading db handle; keep string segments and collection refs.
  doc: vi.fn((...args: unknown[]) => ({
    __docRef: args.filter(
      (a) =>
        typeof a === "string" ||
        (typeof a === "object" &&
          a !== null &&
          ("__collection" in a || "__group" in a)),
    ),
  })),
  // Drop the leading db handle; keep string path segments.
  collection: vi.fn((...args: unknown[]) => ({
    __collection: args.filter((a) => typeof a === "string"),
  })),
  collectionGroup: vi.fn((name: string) => ({ __group: name })),
  query: (...args: unknown[]) => ({ __query: args }),
  where: (field: string, op: string, value: unknown) => ({
    kind: "where",
    field,
    op,
    value,
  }),
  orderBy: (field: string, dir?: string) => ({ kind: "orderBy", field, dir }),
  limit: (n: number) => ({ kind: "limit", n }),
  startAfter: (cursor: unknown) => ({ kind: "startAfter", cursor }),
  writeBatch: vi.fn(() => fsMocks.batch),
  runTransaction: vi.fn(async (_db: unknown, fn: (tx: unknown) => unknown) =>
    fn(fsMocks.tx),
  ),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  increment: (n: number) => ({ __increment: n }),
  arrayUnion: (...vals: unknown[]) => ({ __arrayUnion: vals }),
  arrayRemove: (...vals: unknown[]) => ({ __arrayRemove: vals }),
  serverTimestamp: () => ({ __serverTimestamp: true }),
  Timestamp: class Timestamp {},
};

/** A document snapshot double. */
export const snap = (
  id: string,
  data: Record<string, unknown> = {},
  opts: { exists?: boolean; ref?: unknown } = {},
) => ({
  id,
  exists: () => opts.exists ?? true,
  data: () => data,
  ref: opts.ref ?? { __snapRef: id },
});

/** A query snapshot double. */
export const querySnap = (docs: ReturnType<typeof snap>[] = []) => ({
  docs,
  empty: docs.length === 0,
  forEach: (fn: (d: unknown) => void) => docs.forEach(fn),
});

/** Reset all shared mocks between tests. */
export const resetFsMocks = () => {
  vi.clearAllMocks();
  fsMocks.batch.commit.mockResolvedValue(undefined);
  fsMocks.tx.get.mockReset();
  fsMocks.getDocs.mockReset();
  fsMocks.getDoc.mockReset();
  fsMocks.updateDoc.mockReset().mockResolvedValue(undefined);
  fsMocks.deleteDoc.mockReset().mockResolvedValue(undefined);
  fsMocks.setDoc.mockReset().mockResolvedValue(undefined);
  fsMocks.addDoc.mockReset().mockResolvedValue({ id: "new-doc-id" });
};

/** Standard clientApp mock factory. */
export const clientAppMock = () => ({
  auth: { __auth: true },
  firestore: { __firestore: true },
  storage: { __storage: true },
});
