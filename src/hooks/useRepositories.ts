import { useEffect, useState } from "react";
import { LocalStorage } from "@raycast/api";
import { RepositoryObject } from "../types";
import { getRepos } from "../octokit-interations";

const STORAGE_FULL_NAMES = "cached-full-names";

export const useRepositories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<RepositoryObject[]>([]);

  const refreshRepositories = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(getRepos)
    .then(repos => LocalStorage.setItem(STORAGE_FULL_NAMES, JSON.stringify(repos)).then(() => repos))
    .then(setRepositories)
    .then(() => setIsLoading(false));

  useEffect(() => {
    LocalStorage.getItem(STORAGE_FULL_NAMES)
      .then(parseRepositories)
      .then(pullRepositoriesIfEmpty)
      .then(setRepositories)
      .then(() => setIsLoading(false));
  }, []);

  return { isLoading, repositories, refreshRepositories };
};

const parseRepositories = (serialized: LocalStorage.Value | undefined) => {
  if (!serialized || typeof serialized !== "string" || serialized.length < 3) {
    return [];
  }

  const list = JSON.parse(serialized) as RepositoryObject[];
  if (!list || !list.length || list.length === 0) {
    return [];
  }

  return list;
};

const pullRepositoriesIfEmpty = (repos: RepositoryObject[]) =>
  repos.length > 0
    ? repos
    : getRepos()
      .then(repos => LocalStorage.setItem(STORAGE_FULL_NAMES, JSON.stringify(repos)).then(() => repos));

