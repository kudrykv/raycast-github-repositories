import { ActionPanel, Icon, List, OpenInBrowserAction, SubmitFormAction, PushAction } from "@raycast/api";
import { RepositoryObject } from "./octokit-interations";
import { ListPulls } from "./ListPulls";

interface ListRepositoriesParams {
  isLoading: boolean;
  repositories: RepositoryObject[];
  onRefresh: () => void;
}

export const ListRepositories = ({ repositories, isLoading, onRefresh }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {repositories.map(repo => <List.Item
      id={repo.full_name}
      key={repo.full_name}
      title={repo.full_name}
      icon={repo.owner?.avatar_url ? repo.owner.avatar_url : { source: { light: "icon.png", dark: "icon@dark.png" } }}
      subtitle={repo.stargazers_count ? `☆ ${repo.stargazers_count}` : undefined}
      actions={isLoading ? undefined : <RepositoryItemActionPanel repo={repo} onRefresh={onRefresh} />}
    />)}
  </List>;


const RepositoryItemActionPanel = ({ repo, onRefresh }: { repo: RepositoryObject, onRefresh: () => void }) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${repo.full_name}`} />
    <PushAction
      title={"Pull Requests"}
      target={<ListPulls owner={repo.owner?.login || ''} repo={repo.name} />}
      shortcut={{key: "p", modifiers: ["cmd", "shift"]}}
    />
    <SubmitFormAction icon={Icon.ArrowClockwise} title={"Refresh Repositories List"} onSubmit={onRefresh} />
  </ActionPanel>;
