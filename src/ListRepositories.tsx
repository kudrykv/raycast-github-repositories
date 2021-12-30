import { ActionPanel, List, OpenInBrowserAction, SubmitFormAction } from "@raycast/api";

interface ListRepositoriesParams {
  isLoading: boolean;
  names: string[];
  onRefresh: () => void;
}


export const ListRepositories = ({ names, isLoading, onRefresh }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {names.map(name => <RepositoryItem key={name} name={name} onRefresh={onRefresh} />)}
  </List>;


const RepositoryItem = ({ name, onRefresh }: { name: string, onRefresh: () => void }) =>
  <List.Item
    key={name}
    title={name}
    icon={{ source: { light: "icon.png", dark: "icon@dark.png" } }}
    actions={<RepositoryItemActionPanel name={name} onRefresh={onRefresh} />}
  />;


const RepositoryItemActionPanel = ({ name, onRefresh }: { name: string, onRefresh: () => void }) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${name}`} />
    <OpenInBrowserAction
      title="Open Pull Requests"
      url={`https://github.com/${name}/pulls`}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
    />
    <SubmitFormAction title={"Refresh Repositories List"} onSubmit={onRefresh} />
  </ActionPanel>;
