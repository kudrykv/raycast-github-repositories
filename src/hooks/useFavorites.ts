import { useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";

const STORAGE_FAVS = "starred-repos-full-names";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const addFavorite = ({ full_name }: {full_name: string}) => Promise.resolve(favorites)
    .then(favs =>
      favs.find(fav => fav === full_name)
        ? favs
        : [...favs, full_name]
    )
    .then(favs => setLocalStorageItem(STORAGE_FAVS, JSON.stringify(favs)).then(() => favs))
    .then(setFavorites);

  const rmFavorite = ({ full_name }: { full_name: string }) => Promise.resolve(favorites)
    .then(favs => favs.filter(fav => fav !== full_name))
    .then(favs => setLocalStorageItem(STORAGE_FAVS, JSON.stringify(favs)).then(() => favs))
    .then(setFavorites);

  useEffect(() => {
    getLocalStorageItem(STORAGE_FAVS)
      .then((serialized: LocalStorageValue | undefined) => {
        if (!serialized || typeof serialized !== "string") {
          return [];
        }

        return JSON.parse(serialized) || [];
      })
      .then(setFavorites);
  }, []);

  return { favorites, addFavorite, rmFavorite };
};
