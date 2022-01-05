// noinspection JSUnusedGlobalSymbols

import {
  clearLocalStorage,
  getLocalStorageItem,
  LocalStorageValue,
  setLocalStorageItem,
  showToast,
  ToastStyle
} from "@raycast/api";
import { useEffect, useState } from "react";

import { getRepos, RepositoryObject } from "./octokit-interations";
import { ListRepositories } from "./ListRepositories";

const STORAGE_FULL_NAMES = "cached-full-names";
const LOADING_TITLE = "Loading repositories that you can access. It may take a while...";
const LOADING = [{ full_name: LOADING_TITLE } as RepositoryObject];

const Command = () => {
  const [repositories, setRepositories] = useState<RepositoryObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onRefresh = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(() => setRepositories(LOADING))
    .then(pullRepos)
    .then(cacheRepos)
    .then(setRepositories)
    .then(() => setIsLoading(false))
    .catch(showError);

  useEffect(() => {
    getLocalStorageItem(STORAGE_FULL_NAMES)
      .then((value) => {
        !value && setRepositories(LOADING);

        return value;
      })
      .then(readSerialized)
      .then(cacheIfNotYetCached)
      .then(setRepositories)
      .then(() => setIsLoading(false))
      .catch(showError);
  }, []);

  return <ListRepositories isLoading={isLoading} repositories={repositories} onRefresh={onRefresh} />;
};

export default Command;


const pullRepos = () => getRepos()
  .then(list => ({ list, cache: false }));


const readSerialized = (serialized: LocalStorageValue | undefined) => {
  console.debug("getting value from the local storage -- typeof is", typeof serialized);

  if (!serialized || typeof serialized !== "string") {
    console.debug("pulling data b/c nothing has been found in the local storage");

    return pullRepos();
  }

  console.debug("parsing serialized");
  const list = JSON.parse(serialized) as RepositoryObject[];

  if (!list || !list.length || list.length === 0) {
    console.debug("no repos were found in parsed data");

    return pullRepos();
  }

  console.debug("returning cached data");

  return Promise.resolve({ list, cache: true });
};


const cacheRepos = ({ list }: { list: RepositoryObject[] }) =>
  setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(list))
    .then(() => list);


const cacheIfNotYetCached = ({ list, cache }: { list: RepositoryObject[], cache: boolean }): Promise<RepositoryObject[]> =>
  cache
    ? Promise.resolve(list)
    : cacheRepos({ list });


const showError = (e: Error) => showToast(ToastStyle.Failure, e.message);
