// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./ListRepositories";
import { useRepositories } from "./useRepositories";

const Command = () => {
  const { isLoading, favorites, rest, onRefresh, onStar, onUnstar } = useRepositories();

  return <ListRepositories
    isLoading={isLoading}
    favorites={favorites}
    rest={rest}
    onRefresh={onRefresh}
    onStar={onStar}
    onUnstar={onUnstar}
  />;
};

export default Command;

