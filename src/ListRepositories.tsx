import { ActionPanel, Icon, List, OpenInBrowserAction, SubmitFormAction } from "@raycast/api";
import { RepositoryObject } from "./octokit-interations";

interface ListRepositoriesParams {
  isLoading: boolean;
  repositories: RepositoryObject[];
  onRefresh: () => void;
}

export const ListRepositories = ({ repositories, isLoading, onRefresh }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {repositories.map(repo => <RepositoryItem
      key={repo.full_name}
      repo={repo}
      isLoading={isLoading}
      onRefresh={onRefresh}
    />)}
  </List>;


interface RepositoryItemParams {
  repo: RepositoryObject;
  isLoading: boolean;
  onRefresh: () => void;
}

const RepositoryItem = ({ repo, isLoading, onRefresh }: RepositoryItemParams) =>
  <List.Item
    id={repo.full_name}
    key={repo.full_name}
    title={repo.full_name}
    icon={repo.owner?.avatar_url ? repo.owner.avatar_url : { source: { light: "icon.png", dark: "icon@dark.png" } }}
    subtitle={repo.stargazers_count ? `☆ ${repo.stargazers_count}` : undefined}
    actions={isLoading ? undefined : <RepositoryItemActionPanel repo={repo} onRefresh={onRefresh} />}
  />;


const RepositoryItemActionPanel = ({ repo, onRefresh }: { repo: RepositoryObject, onRefresh: () => void }) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${repo.full_name}`} />
    <OpenInBrowserAction
      title="Open Pull Requests"
      url={`https://github.com/${repo.full_name}/pulls`}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
    />
    <SubmitFormAction icon={Icon.ArrowClockwise} title={"Refresh Repositories List"} onSubmit={onRefresh} />
  </ActionPanel>;
