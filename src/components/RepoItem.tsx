import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { RepositoryObject } from "../types";
import { ListPulls } from "./ListPulls";

interface RepoItemParams {
  repo: RepositoryObject;
  isLoading: boolean;
  onRefresh: () => void;
  onFavorite?: ({ full_name }: { full_name: string }) => void;
  onUnFavorite?: ({ full_name }: { full_name: string }) => void;
}

export const RepoItem = ({ repo, isLoading, onRefresh, onFavorite, onUnFavorite }: RepoItemParams) =>
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
    <Action.OpenInBrowser title="Open repository" url={`https://github.com/${repo.full_name}`} />
    <Action.Push
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