import { ActionPanel, List, OpenInBrowserAction } from "@raycast/api";

interface ListRepositoriesParams {
  isLoading: boolean;
  names: string[];
}


export const ListRepositories = ({ names, isLoading }: ListRepositoriesParams) =>
  <List isLoading={isLoading}>
    {names.map(name => <RepositoryItem key={name} name={name} />)}
  </List>;


const RepositoryItem = ({ name }: { name: string }) =>
  <List.Item
    key={name}
    title={name}
    icon={{source: {light: 'icon.png', dark: 'icon@dark.png'}}}
    actions={<RepositoryItemActionPanel name={name} />}
  />;


const RepositoryItemActionPanel = ({ name }: { name: string }) =>
  <ActionPanel>
    <OpenInBrowserAction title="Open repository" url={`https://github.com/${name}`} />
    <OpenInBrowserAction
      title="Open repository"
      url={`https://github.com/${name}/pulls`}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
    />
  </ActionPanel>;
