import { ActionPanel, Icon, List, OpenInBrowserAction, PushAction } from "@raycast/api";
import { ListPulls } from "./ListPulls";
import { RepositoryObject } from "./types";

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


interface RepoItemParams {
  repo: RepositoryObject;
  isLoading: boolean;
  onRefresh: () => void;
  onFavorite?: ({ full_name }: { full_name: string }) => void;
  onUnFavorite?: ({ full_name }: { full_name: string }) => void;
}

const RepoItem = ({ repo, isLoading, onRefresh, onFavorite, onUnFavorite }: RepoItemParams) =>
  <List.Item
    id={repo.full_name}
    key={repo.full_name}
    title={repo.full_name}
    icon={repo.owner?.avatar_url ? repo.owner.avatar_url : { source: { light: "icon.png", dark: "icon@dark.png" } }}
    subtitle={repo.stargazers_count ? `☆ ${repo.stargazers_count}` : undefined}
    actions={
      isLoading
        ? undefined
        : <RepositoryItemActionPanel repo={repo} onRefresh={onRefresh} onFavorite={onFavorite}
                                     onUnFavorite={onUnFavorite} />
    }
  />;


interface RepoItemActionPanelParams {
  repo: RepositoryObject;
  onRefresh: () => void;
  onFavorite?: ({ full_name }: { full_name: string }) => void;
  onUnFavorite?: ({ full_name }: { full_name: string }) => void;
}

const RepositoryItemActionPanel = ({ repo, onRefresh, onFavorite, onUnFavorite }: RepoItemActionPanelParams) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${repo.full_name}`} />
    <PushAction
      title={"Pull Requests"}
      target={<ListPulls owner={repo.owner?.login || ""} repo={repo.name} />}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
      icon={{ source: { light: "git-pull-request.png", dark: "git-pull-request.png" } }}
    />
    {onFavorite &&
      <ActionPanel.Item
        icon={Icon.ArrowClockwise}
        title={"Favorite"}
        onAction={() => onFavorite({ full_name: repo.full_name })}
        shortcut={{ key: "f", modifiers: ["cmd", "shift"] }}
      />
    }
    {onUnFavorite &&
      <ActionPanel.Item
        icon={Icon.ArrowClockwise}
        title={"Unfavorite"}
        onAction={() => onUnFavorite({ full_name: repo.full_name })}
        shortcut={{ key: "f", modifiers: ["cmd", "shift"] }}
      />
    }
    <ActionPanel.Item icon={Icon.ArrowClockwise} title={"Refresh Repositories List"} onAction={onRefresh} />
  </ActionPanel>;
