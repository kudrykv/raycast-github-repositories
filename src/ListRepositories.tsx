import { ActionPanel, Icon, List, OpenInBrowserAction, PushAction } from "@raycast/api";
import { ListPulls } from "./ListPulls";
import { RepositoryObject } from "./types";

interface ListRepositoriesParams {
  isLoading: boolean;
  favorites: RepositoryObject[];
  rest: RepositoryObject[];
  onRefresh: () => void;
  onStar: ({ full_name }: { full_name: string }) => void;
  onUnstar: ({ full_name }: { full_name: string }) => void;
}

export const ListRepositories = ({ favorites, rest, isLoading, onRefresh, onStar, onUnstar }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {favorites && favorites.length > 0 &&
      <List.Section title="Starred">
        {favorites.map(repo => <RepoItem
          key={repo.id}
          repo={repo}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onUnstar={onUnstar}
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
          onStar={onStar}
        />)}
      </List.Section>
    }
  </List>;


interface RepoItemParams {
  repo: RepositoryObject;
  isLoading: boolean;
  onRefresh: () => void;
  onStar?: ({ full_name }: { full_name: string }) => void;
  onUnstar?: ({ full_name }: { full_name: string }) => void;
}

const RepoItem = ({ repo, isLoading, onRefresh, onStar, onUnstar }: RepoItemParams) =>
  <List.Item
    id={repo.full_name}
    key={repo.full_name}
    title={repo.full_name}
    icon={repo.owner?.avatar_url ? repo.owner.avatar_url : { source: { light: "icon.png", dark: "icon@dark.png" } }}
    subtitle={repo.stargazers_count ? `☆ ${repo.stargazers_count}` : undefined}
    actions={
      isLoading
        ? undefined
        : <RepositoryItemActionPanel repo={repo} onRefresh={onRefresh} onStar={onStar} onUnstar={onUnstar} />
    }
  />;


interface RepoItemActionPanelParams {
  repo: RepositoryObject;
  onRefresh: () => void;
  onStar?: ({ full_name }: { full_name: string }) => void;
  onUnstar?: ({ full_name }: { full_name: string }) => void;
}

const RepositoryItemActionPanel = ({ repo, onRefresh, onStar, onUnstar }: RepoItemActionPanelParams) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${repo.full_name}`} />
    <PushAction
      title={"Pull Requests"}
      target={<ListPulls owner={repo.owner?.login || ""} repo={repo.name} />}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
      icon={{ source: { light: "git-pull-request.png", dark: "git-pull-request.png" } }}
    />
    <ActionPanel.Item icon={Icon.ArrowClockwise} title={"Refresh Repositories List"} onAction={onRefresh} />
    {onStar &&
      <ActionPanel.Item
        icon={Icon.ArrowClockwise}
        title={"Star"}
        onAction={() => onStar({ full_name: repo.full_name })}
        shortcut={{ key: "s", modifiers: ["cmd", "shift"] }}
      />
    }
    {onUnstar &&
      <ActionPanel.Item
        icon={Icon.ArrowClockwise}
        title={"Unstar"}
        onAction={() => onUnstar({ full_name: repo.full_name })}
        shortcut={{ key: "s", modifiers: ["cmd", "shift"] }}
      />
    }
  </ActionPanel>;
