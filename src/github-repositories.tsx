// noinspection JSUnusedGlobalSymbols

import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";
import { useEffect, useState } from "react";

import { getRepos } from "./octokit-interations";
import { ListRepositories } from "./ListRepositories";

const STORAGE_FULL_NAMES = "cached-full-names";


const command = () => {
  const [names, setNames] = useState<string[]>(["Loading..."]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLocalStorageItem(STORAGE_FULL_NAMES)
      .then(readSerialized)
      .then(cacheIfNotYetCached)
      .then(setNames)
      .then(() => setIsLoading(false));
  }, []);

  return <ListRepositories isLoading={isLoading} names={names} />;
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


const cacheNames = (names: string[]) =>
  setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(names)).then(() => names);


const cacheIfNotYetCached = ({ names, cache }: { names: string[], cache: boolean }): Promise<string[]> =>
  cache
    ? Promise.resolve(names)
    : cacheNames(names);
