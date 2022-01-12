// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./ListRepositories";
import { useReposListing } from "./useReposListing";

const Command = () => {
  const { isLoading, rest, faved, rmFavorite, addFavorite, refreshRepositories } = useReposListing();

  return <ListRepositories
    isLoading={isLoading}
    favorites={faved}
    rest={rest}
    onRefresh={refreshRepositories}
    onFavorite={addFavorite}
    onUnFavorite={rmFavorite}
  />;
};

export default Command;

