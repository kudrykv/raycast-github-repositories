import { List } from "@raycast/api";
import { RepositoryObject } from "../types";
import { RepoItem } from "./RepoItem";

interface ListRepositoriesParams {
  isLoading: boolean;
  favorites: RepositoryObject[];
  rest: RepositoryObject[];
  onRefresh: () => void;
  onFavorite: ({ full_name }: { full_name: string }) => void;
  onUnFavorite: ({ full_name }: { full_name: string }) => void;
}

export const ListRepositories = ({
                                   favorites,
                                   rest,
                                   isLoading,
                                   onRefresh,
                                   onFavorite,
                                   onUnFavorite
                                 }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {favorites && favorites.length > 0 &&
      <List.Section title="Favorites">
        {favorites.map(repo => <RepoItem
          key={repo.id}
          repo={repo}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onUnFavorite={onUnFavorite}
        />)}
      </List.Section>
    }
    {rest && rest.length > 0 &&
      <List.Section title="Repos">
        {rest.map(repo => <RepoItem
          key={repo.id}
          repo={repo}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onFavorite={onFavorite}
        />)}
      </List.Section>
    }
  </List>;


