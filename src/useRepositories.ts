import { useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageValue, setLocalStorageItem } from "@raycast/api";
import { RepositoryObject } from "./types";
import { getRepos } from "./octokit-interations";

const STORAGE_FULL_NAMES = "cached-full-names";

export const useRepositories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<RepositoryObject[]>([]);

  const refreshRepositories = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(getRepos)
    .then(repos => setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(repos)).then(() => repos))
    .then(setRepositories)
    .then(() => setIsLoading(false));

  useEffect(() => {
    getLocalStorageItem(STORAGE_FULL_NAMES)
      .then((serialized: LocalStorageValue | undefined) => {
        if (!serialized || typeof serialized !== "string" || serialized.length < 3) {
          return [];
        }

        const list = JSON.parse(serialized) as RepositoryObject[];
        if (!list || !list.length || list.length === 0) {
          return [];
        }

        return list;
      })
      .then(
        repos =>
          repos.length > 0
            ? repos
            : getRepos()
              .then(repos => setLocalStorageItem(STORAGE_FULL_NAMES, JSON.stringify(repos)).then(() => repos))
      )
      .then(setRepositories)
      .then(() => setIsLoading(false));
  }, []);

  return { isLoading, repositories, refreshRepositories };
};
