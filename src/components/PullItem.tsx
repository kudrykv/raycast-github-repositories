import { PullObject, ReviewObject } from "../types";
import { Action, ActionPanel, Color, getPreferenceValues, Image, List } from "@raycast/api";

const jiraDomain = getPreferenceValues()["jira_domain"];

export const PullItem = ({ pull, onReload }: { pull: PullObject, onReload?: () => void }) =>
  <List.Item
    icon={pullIcon(pull)}
    title={pull.title}
    subtitle={reviewStatus(pull.reviews)}
    accessoryIcon={pull.user.avatar_url}
    accessoryTitle={new Date(pull.created_at).toLocaleString()}
    actions={
      <ActionPanel>
        <Action.OpenInBrowser url={pull.html_url} />
        {
          jiraDomain && jiraTicket(pull.title) &&
          <Action.OpenInBrowser
            title="Open in JIRA"
            url={`${jiraDomain}/browse/${jiraTicket(pull.title)}`}
            shortcut={{ key: "j", modifiers: ["cmd"] }}
          />
        }
        {
          jiraTicket(pull.title) &&
          <Action.CopyToClipboard
            content={jiraTicket(pull.title) || ""}
            shortcut={{ key: "c", modifiers: ["cmd"] }}
          />
        }
        {onReload && <ActionPanel.Item title={"Reload Pulls"} onAction={onReload} />}
      </ActionPanel>
    }
  />;

const reviewStatus = (reviews: ReviewObject[] | undefined) => {
  const lastReviews = reviews && reviews
    .sort((l, r) => new Date(r.submitted_at).getTime() - new Date(l.submitted_at).getTime())
    .filter((review, idx, self) => self.findIndex(({ user: { login } }) => login === review.user.login) === idx);

  return !lastReviews || lastReviews.length === 0
    ? "🟡"
    : lastReviews.map(review => reviewStatesToEmojis[review.state] || "⚪️").join("");
};

const reviewStatesToEmojis = {
  "APPROVED": "🟢",
  "COMMENTED": "⚪️",
  "CHANGES_REQUESTED": "🔴",
  "DISMISSED": "⚪️"
} as Record<string, string>;

const pullIcon = ({ draft, merged_at, closed_at }: PullObject): Image.ImageLike => {
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

const jiraTicket = (title: string): string | undefined => {
  const match = title.match(/[A-Z]{2,30}-\d+/);

  if (!match) return;

  return match[0];
};