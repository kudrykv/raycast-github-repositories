// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./ListRepositories";
import { useRepositories } from "./useRepositories";

const Command = () => {
  const { isLoading, starred, rest, onRefresh, onStar, onUnstar } = useRepositories();

  return <ListRepositories
    isLoading={isLoading}
    starred={starred}
    rest={rest}
    onRefresh={onRefresh}
    onStar={onStar}
    onUnstar={onUnstar}
  />;
};

export default Command;

