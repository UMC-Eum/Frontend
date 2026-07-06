import { NativeModules, TurboModuleRegistry } from "react-native";
import type { StateStorage } from "zustand/middleware";

type NativeAsyncStorageModule = {
  multiGet: (
    keys: string[],
    callback: (errors?: unknown[] | null, result?: [string, string | null][]) => void,
  ) => void;
  multiSet: (
    entries: [string, string][],
    callback: (errors?: unknown[] | null) => void,
  ) => void;
  multiRemove: (
    keys: string[],
    callback: (errors?: unknown[] | null) => void,
  ) => void;
};

const memoryStorage = new Map<string, string>();
let hasWarned = false;

function getNativeAsyncStorageModule() {
  const turboModuleRegistry = TurboModuleRegistry as
    | { get?: (name: string) => unknown }
    | undefined;
  const getTurboModule = (name: string) => turboModuleRegistry?.get?.(name);

  return (
    getTurboModule("PlatformLocalStorage") ||
    getTurboModule("RNC_AsyncSQLiteDBStorage") ||
    getTurboModule("RNCAsyncStorage") ||
    getTurboModule("AsyncSQLiteDBStorage") ||
    getTurboModule("AsyncLocalStorage") ||
    NativeModules.PlatformLocalStorage ||
    NativeModules.RNC_AsyncSQLiteDBStorage ||
    NativeModules.RNCAsyncStorage ||
    NativeModules.AsyncSQLiteDBStorage ||
    NativeModules.AsyncLocalStorage ||
    null
  ) as NativeAsyncStorageModule | null;
}

function warnFallback(error?: unknown) {
  if (__DEV__ && !hasWarned) {
    hasWarned = true;
    console.log("[safeAsyncStorage] falling back to memory storage", error);
  }
}

export const safeAsyncStorage: StateStorage = {
  getItem: async (key) => {
    const storage = getNativeAsyncStorageModule();
    if (!storage) {
      warnFallback();
      return memoryStorage.get(key) ?? null;
    }

    return new Promise((resolve) => {
      storage.multiGet([key], (errors, result) => {
        if (errors?.length) {
          warnFallback(errors);
          resolve(memoryStorage.get(key) ?? null);
          return;
        }

        resolve(result?.[0]?.[1] ?? null);
      });
    });
  },
  setItem: async (key, value) => {
    const storage = getNativeAsyncStorageModule();
    if (!storage) {
      warnFallback();
      memoryStorage.set(key, value);
      return;
    }

    await new Promise<void>((resolve) => {
      storage.multiSet([[key, value]], (errors) => {
        if (errors?.length) {
          warnFallback(errors);
          memoryStorage.set(key, value);
        }
        resolve();
      });
    });
  },
  removeItem: async (key) => {
    const storage = getNativeAsyncStorageModule();
    if (!storage) {
      warnFallback();
      memoryStorage.delete(key);
      return;
    }

    await new Promise<void>((resolve) => {
      storage.multiRemove([key], (errors) => {
        if (errors?.length) {
          warnFallback(errors);
          memoryStorage.delete(key);
        }
        resolve();
      });
    });
  },
};
