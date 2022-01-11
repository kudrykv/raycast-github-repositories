import { getLocalStorageItem, LocalStorageValue } from "@raycast/api";

const STORAGE_FAVS = "starred-repos-full-names";

export const getFavorites = (): Promise<string[]> =>
  getLocalStorageItem(STORAGE_FAVS)
    .then((serialized: LocalStorageValue | undefined) => {
      if (!serialized || typeof serialized !== "string") {
        return [];
      }

      return JSON.parse(serialized) || [];
    });

