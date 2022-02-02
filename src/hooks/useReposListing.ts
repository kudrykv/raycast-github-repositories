import { useRepositories } from "./useRepositories";
import { useFavorites } from "./useFavorites";
import { useEffect, useState } from "react";
import { RepositoryObject } from "../types";

export const useReposListing = () => {
  const { favorites, addFavorite, rmFavorite } = useFavorites();
  const { isLoading, repositories, refreshRepositories } = useRepositories();
  const [{ faved, rest }, setState] = useState({
    faved: [],
    rest: []
  } as { faved: RepositoryObject[], rest: RepositoryObject[] });

  useEffect(() => {
    setState(groupByFavorites([repositories, favorites]));
  }, [repositories, favorites]);

  return { faved, rest, isLoading, addFavorite, rmFavorite, refreshRepositories };
};

const groupByFavorites = ([repos, favs]: [RepositoryObject[], string[]]) =>
  repos.reduce(({ faved, rest }, curr) => {
    favs.find(fav => fav === curr.full_name)
      ? faved.push(curr)
      : rest.push(curr);

    return { faved, rest };
  }, { faved: [], rest: [] } as { faved: RepositoryObject[], rest: RepositoryObject[] });
