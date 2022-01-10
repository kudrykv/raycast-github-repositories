import { useEffect, useState } from "react";
import { RepositoryObject } from "./types";
import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";
import { getRepos } from "./octokit-interations";

const STORAGE_FULL_NAMES = "cached-full-names";
const STORAGE_STARRED = "starred-repos-full-names";

export const useRepositories = () => {
  const [{ starred, rest, isLoading }, setState] = useState({
    starred: [] as RepositoryObject[],
    rest: [] as RepositoryObject[],
    isLoading: true
  });

  const onRefresh = () => Promise.all([
    Promise.resolve()
      .then(() => setState(prev => ({ ...prev, isLoading: true })))
      .then(getRepos)
      .then(list => ({ list, cache: false }))
      .then(cacheIfNotYetCached),
    getLocalStorageItem(STORAGE_STARRED)
      .then(parseSerializedStars)
  ])
    .then(groupByStars)
    .then(({ rest }) => setState(prev => ({ ...prev, rest, isLoading: false })));


  useEffect(() => {
    Promise.all([
      getLocalStorageItem(STORAGE_FULL_NAMES)
        .then(serializedRepos)
        .then(pullOnEmptyCache)
        .then(cacheIfNotYetCached),
      getLocalStorageItem(STORAGE_STARRED)
        .then(parseSerializedStars)
    ])
      .then(groupByStars)
      .then(({ starred, rest }) => setState({ starred, rest, isLoading: false }));
  }, []);

  return { isLoading, starred, rest, onRefresh };
};


const groupByStars = ([repos, stars]: [RepositoryObject[], string[]]) =>
  repos.reduce(({ starred, rest }, curr) => {
    stars.find(star => star === curr.full_name)
      ? starred.push(curr)
      : rest.push(curr);

    return { starred, rest };
  }, { starred: [], rest: [] } as { starred: RepositoryObject[], rest: RepositoryObject[] });


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


const parseSerializedStars = (serialized: LocalStorageValue | undefined): string[] => {
  if (!serialized || typeof serialized !== "string") {
    return [];
  }

  return JSON.parse(serialized) || [];
};


const cacheIfNotYetCached = ({ list, cache }: { list: RepositoryObject[], cache: boolean }) =>
  cache
    ? Promise.resolve(list)
    : setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(list)).then(() => list);
