const CHUNK_RECOVERY_KEY = "promplify:chunk-recovery";
const CHUNK_RECOVERY_WINDOW_MS = 60_000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type RecoveryMarker = {
  href: string;
  timestamp: number;
};

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  return /failed to fetch dynamically imported module|error loading dynamically imported module|loading chunk [\w-]+ failed/i.test(message);
}

function readMarker(storage: StorageLike): RecoveryMarker | null {
  try {
    const value = JSON.parse(storage.getItem(CHUNK_RECOVERY_KEY) || "null");
    if (value && typeof value.href === "string" && typeof value.timestamp === "number") {
      return value;
    }
  } catch {
    // Invalid or inaccessible storage is handled by the guarded marker write.
  }
  return null;
}

export function recoverChunkLoad(error: unknown, href: string, storage: StorageLike, reload: () => void, now = Date.now()): boolean {
  if (!isChunkLoadError(error)) {
    return false;
  }

  const marker = readMarker(storage);
  if (marker?.href === href && now - marker.timestamp < CHUNK_RECOVERY_WINDOW_MS) {
    return false;
  }

  try {
    storage.setItem(CHUNK_RECOVERY_KEY, JSON.stringify({ href, timestamp: now }));
  } catch {
    // Without a persistent marker, automatic navigation could loop indefinitely.
    return false;
  }
  reload();
  return true;
}

export function clearChunkRecovery(storage: StorageLike): void {
  try {
    storage.removeItem(CHUNK_RECOVERY_KEY);
  } catch {
    // Manual navigation should still work when browser storage is unavailable.
  }
}

export function installChunkLoadRecovery(): void {
  window.addEventListener("vite:preloadError", (event) => {
    const preloadEvent = event as Event & { payload?: unknown };
    if (!isChunkLoadError(preloadEvent.payload)) {
      return;
    }

    // Let Vite reject the import so React receives the original error, not undefined.
    recoverChunkLoad(preloadEvent.payload, window.location.href, window.sessionStorage, () => window.location.reload());
  });
}
