import { ActionPanel, Color, ImageLike, List, OpenInBrowserAction } from "@raycast/api";
import { useEffect, useState } from "react";
import { getPreparedPulls } from "./octokit-interations";
import { PullObject } from "./types";

export const ListPulls = ({ owner, repo }: { owner: string, repo: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pulls, setPulls] = useState({ open: [] as PullObject[], closed: [] as PullObject[] });

  useEffect(() => {
    getPreparedPulls({ owner, repo })
      .then(setPulls)
      .then(() => setIsLoading(false));
  }, []);

  return <List isLoading={isLoading}>
    {pulls.open && pulls.open.length > 0 &&
      <List.Section title="Open Pull Requests">
        {pulls.open.map(pull => <PullItem key={pull.id} pull={pull} />)}
      </List.Section>
    }
    {pulls.closed && pulls.closed.length > 0 &&
      <List.Section title="Recently Closed">
        {pulls.closed.map(pull => <PullItem key={pull.id} pull={pull} />)}
      </List.Section>
    }
  </List>;
};


export const PullItem = ({ pull, onReload }: { pull: PullObject, onReload?: () => void }) =>
  <List.Item
    title={pull.title}
    icon={pullIcon(pull)}
    accessoryIcon={pull.user.avatar_url}
    accessoryTitle={new Date(pull.created_at).toLocaleString()}
    actions={
      <ActionPanel>
        <OpenInBrowserAction url={pull.html_url} />
        {onReload && <ActionPanel.Item title={"Reload Pulls"} onAction={onReload} />}
      </ActionPanel>
    }
  />


const pullIcon = ({ draft, merged_at, closed_at }: PullObject): ImageLike => {
  if (draft) {
    return { source: { light: "git-pull-request-draft.png", dark: "git-pull-request-draft.png" } };
  }

  if (merged_at) {
    return { source: { light: "git-pull-request.png", dark: "git-pull-request.png" }, tintColor: Color.Purple };
  }

  if (closed_at) {
    return {
      source: { light: "git-pull-request-closed.png", dark: "git-pull-request-closed.png" },
      tintColor: Color.Red
    };
  }

  return { source: { light: "git-pull-request.png", dark: "git-pull-request.png" }, tintColor: Color.Green };
};
