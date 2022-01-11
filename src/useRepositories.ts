import { useEffect, useState } from "react";
import { RepositoryObject } from "./types";
import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";
import { getRepos } from "./octokit-interations";

const STORAGE_FULL_NAMES = "cached-full-names";
const STORAGE_FAVS = "starred-repos-full-names";

export const useRepositories = () => {
  const [{ favorites, rest, isLoading }, setState] = useState({
    favorites: [] as RepositoryObject[],
    rest: [] as RepositoryObject[],
    isLoading: true
  });

  const onRefresh = () => Promise.all([
    Promise.resolve()
      .then(() => setState(prev => ({ ...prev, isLoading: true })))
      .then(getRepos)
      .then(list => ({ list, cache: false }))
      .then(cacheIfNotYetCached),
    getLocalStorageItem(STORAGE_FAVS)
      .then(parseSerializedFavs)
  ])
    .then(groupByFavorites)
    .then(({ rest }) => setState(prev => ({ ...prev, rest, isLoading: false })));

  const onFavorite = ({ full_name }: { full_name: string }) => Promise.resolve()
    .then(() => setState(({ favorites, rest, ...other }) => {
      [rest, favorites] = putFromLeftToRight(rest, favorites)(full_name);

      return { ...other, favorites, rest };
    }))
    .then(() => favorites.map(repo => repo.full_name).concat(full_name))
    .then(favs => setLocalStorageItem(STORAGE_FAVS, JSON.stringify(favs)));

  const onUnFavorite = ({ full_name }: { full_name: string }) => Promise.resolve()
    .then(() => setState(({ favorites, rest, ...other }) => {
      [favorites, rest] = putFromLeftToRight(favorites, rest)(full_name);

      return { ...other, favorites, rest };
    }))
    .then(() => favorites.map(repo => repo.full_name).filter(name => name !== full_name))
    .then(favs => setLocalStorageItem(STORAGE_FAVS, JSON.stringify(favs)));

  useEffect(() => {
    Promise.all([
      getLocalStorageItem(STORAGE_FULL_NAMES)
        .then(serializedRepos)
        .then(pullOnEmptyCache)
        .then(cacheIfNotYetCached),
      getLocalStorageItem(STORAGE_FAVS)
        .then(parseSerializedFavs)
    ])
      .then(groupByFavorites)
      .then(({ favorites, rest }) => setState({ favorites, rest, isLoading: false }));
  }, []);

  return { isLoading, favorites, rest, onRefresh, onFavorite: onFavorite, onUnFavorite: onUnFavorite };
};


const groupByFavorites = ([repos, favs]: [RepositoryObject[], string[]]) =>
  repos.reduce(({ favorites, rest }, curr) => {
    favs.find(fav => fav === curr.full_name)
      ? favorites.push(curr)
      : rest.push(curr);

    return { favorites, rest };
  }, { favorites: [], rest: [] } as { favorites: RepositoryObject[], rest: RepositoryObject[] });


const serializedRepos = (serialized: LocalStorageValue | undefined) => {
  if (!serialized || typeof serialized !== "string" || serialized.length < 3) {
    return { list: [], cache: false };
  }

  const list = JSON.parse(serialized) as RepositoryObject[];
  if (!list || !list.length || list.length === 0) {
    return { list: [], cache: false };
  }

  return { list, cache: true };
};


const pullOnEmptyCache = ({ list, cache }: { list: RepositoryObject[], cache: boolean }) =>
  cache
    ? Promise.resolve({ list, cache })
    : getRepos().then(list => ({ list, cache: false }));


const parseSerializedFavs = (serialized: LocalStorageValue | undefined): string[] => {
  if (!serialized || typeof serialized !== "string") {
    return [];
  }

  return JSON.parse(serialized) || [];
};


const cacheIfNotYetCached = ({ list, cache }: { list: RepositoryObject[], cache: boolean }) =>
  cache
    ? Promise.resolve(list)
    : setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(list)).then(() => list);


const putFromLeftToRight = (left: RepositoryObject[], right: RepositoryObject[]) =>
  (full_name: string) => {
    const repo = left.find(repo => repo.full_name === full_name);
    if (!repo) {
      return [left, right];
    }

    left = left.filter(repo => repo.full_name !== full_name);

    if (right.length === 0) {
      return [left, [repo]];
    }

    const cutIndex = right.findIndex(repo => full_name.toLowerCase() < repo.full_name.toLowerCase());
    right = cutIndex < 0
      ? [...right, repo]
      : [...right.splice(0, cutIndex), repo, ...right];

    return [left, right];
  };
