// noinspection JSUnusedGlobalSymbols

import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem, showToast, ToastStyle } from "@raycast/api";
import { useEffect, useState } from "react";

import { getRepos } from "./octokit-interations";
import { ListRepositories } from "./ListRepositories";

const STORAGE_FULL_NAMES = "cached-full-names";
const LOADING_TITLE = "Loading repositories that you can access. It may take a while...";

const command = () => {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onRefresh = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(() => setNames([LOADING_TITLE]))
    .then(pullRepos)
    .then(cacheNames)
    .then(setNames)
    .then(() => setIsLoading(false))
    .catch(showError);

  useEffect(() => {
    getLocalStorageItem(STORAGE_FULL_NAMES)
      .then((value) => {
        !value && setNames([LOADING_TITLE]);

        return value;
      })
      .then(readSerialized)
      .then(cacheIfNotYetCached)
      .then(setNames)
      .then(() => setIsLoading(false))
      .catch(showError);
  }, []);

  return <ListRepositories isLoading={isLoading} names={names} onRefresh={onRefresh} />;
};

export default command;


const pullRepos = () => getRepos()
  .then(list => list.map(item => item.full_name))
  .then(names => ({ names, cache: false }));


const readSerialized = (serialized: LocalStorageValue | undefined) => {
  console.debug("getting value from the local storage -- typeof is", typeof serialized);

  if (!serialized || typeof serialized !== "string") {
    console.debug("pulling data b/c nothing has been found in the local storage");

    return pullRepos();
  }

  console.debug("parsing serialized");
  const names = JSON.parse(serialized);

  if (!names || !names.length || names.length === 0) {
    console.debug("no repos were found in parsed data");

    return pullRepos();
  }

  console.debug("returning cached data");

  return { names, cache: true };
};


const cacheNames = ({ names }: { names: string[] }) =>
  setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(names)).then(() => names);


const cacheIfNotYetCached = ({ names, cache }: { names: string[], cache: boolean }): Promise<string[]> =>
  cache
    ? Promise.resolve(names)
    : cacheNames({ names });


const showError = (e: Error) => showToast(ToastStyle.Failure, e.message)
