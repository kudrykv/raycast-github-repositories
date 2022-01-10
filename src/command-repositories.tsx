// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./ListRepositories";
import { useRepositories } from "./useRepositories";

const Command = () => {
  const { isLoading, favorites, rest, onRefresh, onFavorite, onUnFavorite } = useRepositories();

  return <ListRepositories
    isLoading={isLoading}
    favorites={favorites}
    rest={rest}
    onRefresh={onRefresh}
    onFavorite={onFavorite}
    onUnFavorite={onUnFavorite}
  />;
};

export default Command;

