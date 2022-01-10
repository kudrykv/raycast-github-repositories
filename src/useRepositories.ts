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

  const onStar = ({ full_name }: { full_name: string }) =>
    setState(({ starred, rest, ...other }) => {
      [rest, starred] = putFromLeftToRight(rest, starred)(full_name);

      return { ...other, starred, rest };
    });

  const onUnstar = ({ full_name }: { full_name: string }) =>
    setState(({ starred, rest, ...other }) => {
      [starred, rest] = putFromLeftToRight(starred, rest)(full_name);

      return { ...other, starred, rest };
    });

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

  return { isLoading, starred, rest, onRefresh, onStar, onUnstar };
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

const putFromLeftToRight = (left: RepositoryObject[], right: RepositoryObject[]) => {
  return (full_name: string) => {
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
};
