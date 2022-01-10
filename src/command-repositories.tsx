// noinspection JSUnusedGlobalSymbols

import {
  getLocalStorageItem,
  LocalStorageValue,
  setLocalStorageItem,
  showToast,
  ToastStyle
} from "@raycast/api";
import { useEffect, useState } from "react";

import { getRepos } from "./octokit-interations";
import { ListRepositories } from "./ListRepositories";
import { RepositoryObject } from "./types";

const STORAGE_FULL_NAMES = "cached-full-names";
const STORAGE_STARRED = "starred-repos-full-names";

const Command = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [starred, setStarred] = useState<RepositoryObject[]>([]);
  const [rest, setRest] = useState<RepositoryObject[]>([]);

  const onRefresh = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(pullRepos)
    .then(cacheRepos)
    .then(() => setIsLoading(false))
    .catch(showError);

  useEffect(() => {
    Promise.all([
      getLocalStorageItem(STORAGE_FULL_NAMES)
        .then(parseSerializedRepos)
        .then(cacheIfNotYetCached),
      getLocalStorageItem(STORAGE_STARRED)
        .then(parseSerializedStars)
    ])
      .then(([repos, stars]) =>
        repos.reduce(({ starred, rest }, curr) => {
          stars.find(star => star === curr.full_name)
            ? starred.push(curr)
            : rest.push(curr);

          return { starred, rest };
        }, { starred: [], rest: [] } as { starred: RepositoryObject[], rest: RepositoryObject[] }))
      .then(({starred, rest}) => {
        setStarred(starred);
        setRest(rest);
        setIsLoading(false);
      })
  }, []);

  return <ListRepositories
    isLoading={isLoading}
    starred={starred}
    rest={rest}
    onRefresh={onRefresh}
  />;
};

export default Command;


const pullRepos = () => getRepos()
  .then(list => ({ list, cache: false }));


const parseSerializedRepos = (serialized: LocalStorageValue | undefined) => {
  if (!serialized || typeof serialized !== "string") {
    return pullRepos();
  }

  const list = JSON.parse(serialized) as RepositoryObject[];

  if (!list || !list.length || list.length === 0) {
    return pullRepos();
  }

  return Promise.resolve({ list, cache: true });
};


const parseSerializedStars = (serialized: LocalStorageValue | undefined): string[] => {
  if (!serialized || typeof serialized !== "string") {
    return [];
  }

  return JSON.parse(serialized) || [];
};


const cacheRepos = ({ list }: { list: RepositoryObject[] }) =>
  setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(list))
    .then(() => list);


const cacheIfNotYetCached = ({
                               list,
                               cache
                             }: { list: RepositoryObject[], cache: boolean }): Promise<RepositoryObject[]> =>
  cache
    ? Promise.resolve(list)
    : cacheRepos({ list });


const showError = (e: Error) => showToast(ToastStyle.Failure, e.message);
