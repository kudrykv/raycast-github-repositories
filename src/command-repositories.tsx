// noinspection JSUnusedGlobalSymbols

import { ListRepositories } from "./ListRepositories";
import { useRepositories } from "./useRepositories";

const Command = () => {
  const { isLoading, starred, rest, onRefresh } = useRepositories();

  return <ListRepositories
    isLoading={isLoading}
    starred={starred}
    rest={rest}
    onRefresh={onRefresh}
  />;
};

export default Command;

