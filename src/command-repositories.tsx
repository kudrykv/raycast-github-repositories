// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./components/ListRepositories";
import { useReposListing } from "./hooks/useReposListing";

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

