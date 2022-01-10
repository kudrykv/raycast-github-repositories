import { ActionPanel, Icon, List, OpenInBrowserAction, SubmitFormAction, PushAction } from "@raycast/api";
import { ListPulls } from "./ListPulls";
import { RepositoryObject } from "./types";

interface ListRepositoriesParams {
  isLoading: boolean;
  starred: RepositoryObject[];
  rest: RepositoryObject[];
  onRefresh: () => void;
}

export const ListRepositories = ({ starred, rest, isLoading, onRefresh }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {starred && starred.length > 0 &&
      <List.Section title="Starred">
        {starred.map(repo => <RepoItem key={repo.id} repo={repo} isLoading={isLoading} onRefresh={onRefresh} />)}
      </List.Section>
    }
    {rest && rest.length > 0 &&
      <List.Section title="Repos">
        {rest.map(repo => <RepoItem key={repo.id} repo={repo} isLoading={isLoading} onRefresh={onRefresh} />)}
      </List.Section>
    }
  </List>;


const RepoItem = ({
                    repo,
                    isLoading,
                    onRefresh
                  }: { repo: RepositoryObject, isLoading: boolean, onRefresh: () => void }) =>
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
    <PushAction
      title={"Pull Requests"}
      target={<ListPulls owner={repo.owner?.login || ""} repo={repo.name} />}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
      icon={{ source: { light: "git-pull-request.png", dark: "git-pull-request.png" } }}
    />
    <SubmitFormAction icon={Icon.ArrowClockwise} title={"Refresh Repositories List"} onSubmit={onRefresh} />
  </ActionPanel>;
