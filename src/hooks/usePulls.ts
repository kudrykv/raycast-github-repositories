import { useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";
import { getPulls } from "../octokit-interations";
import { useFavorites } from "./useFavorites";
import { PullObject } from "../types";

const STORAGE_PULL_LAST_REFRESH = "pull-last-refresh";
const STORAGE_PULLS = "pulls-cached";

type GroupedPull = [string, PullObject[]];

export const usePulls = () => {
  const { favorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const [favPulls, setFavPulls] = useState<GroupedPull[]>([]);

  const reloadFavPulls = () =>
    Promise.resolve()
      .then(() => setIsLoading(true))
      .then(() => getFavPulls(favorites))
      .then(savePullsToLocalStorage)
      .then(setFavPulls)
      .then(() => setIsLoading(false));

  useEffect(() => {
    if (favorites.length === 0) {
      return;
    }

    getLocalStorageItem(STORAGE_PULL_LAST_REFRESH)
      .then((serialized: LocalStorageValue | undefined) => typeof serialized === "number" ? serialized : 0)
      .then(ts => Date.now() - ts)
      .then(diff =>
        diff > 60_000
          ? getFavPulls(favorites).then(savePullsToLocalStorage)
          : getPullsFromLocalStorage().then(merge =>
            merge.length > 0
              ? Promise.resolve(merge)
              : getFavPulls(favorites).then(savePullsToLocalStorage)
          )
      )
      .then(setFavPulls)
      .then(() => setIsLoading(false));
  }, [favorites]);

  return { isLoading, favPulls, reloadFavPulls };
};


const getFavPulls = (favorites: string[]) =>
  Promise.all([
    Promise.resolve(favorites),
    Promise.all(favorites.map(fav => fav.split("/")).map(([owner, repo]) => getPulls({ owner, repo })))
  ])
    .then(([favs, pulls]) => favs.map((fav, i) => ([fav, pulls[i]]) as GroupedPull))
    .then(merged => merged.filter(([, pulls]) => pulls.length > 0))
    .then(filtered => filtered.sort(([l], [r]) => l < r ? -1 : 1));


const savePullsToLocalStorage = (list: GroupedPull[]) =>
  Promise.resolve()
    .then(() => console.debug("savePullsToLocalStorage"))
    .then(() => setLocalStorageItem(STORAGE_PULLS, JSON.stringify(list)))
    .then(() => setLocalStorageItem(STORAGE_PULL_LAST_REFRESH, Date.now()))
    .then(() => list);


const getPullsFromLocalStorage = () =>
  Promise.resolve()
    .then(() => console.debug("getPullsFromLocalStorage"))
    .then(() => getLocalStorageItem(STORAGE_PULLS))
    .then(parseSerializedPulls);


const parseSerializedPulls = (serialized: LocalStorageValue | undefined) => {
  if (!serialized || typeof serialized !== "string" || serialized.length < 3) {
    return [];
  }

  const list = JSON.parse(serialized) as [string, PullObject[]][];
  if (!list || !list.length || list.length === 0) {
    return [];
  }

  return list;
};
