import { Octokit } from "octokit";
import { getPreferenceValues } from "@raycast/api";

const octokit = new Octokit({ auth: (getPreferenceValues())["github-api-token"] });

export interface RepositoryObject {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner?: {
    id: number;
    login: string;
    avatar_url: string;
    url: string;
  };
  stargazers_count?: number;
  forks_count: number;
  private: boolean;
  html_url: string;
  description: string;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export const getRepos = () =>
  octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, { per_page: 100 })
    .then(list => list as RepositoryObject[]);


export interface PullObject {
  url: string;
  id: number;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    type: string;
  };
  body: string;
  labels: {
    id: number;
    url: string;
    name: string;
    description: string;
    color: string;
    default: boolean;
  }[];
  active_lock_reason?: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  assignee?: {
    login: string;
    id: number;
    avatar_url: string;
    type: string;
  };
  requested_reviewers?: {
    login: string;
    id: number;
    avatar_url: string;
    type: string;
  }[];
  requested_teams?: {
    id: number;
    url: string;
    html_url: string;
    name: string;
    slug: string;
    description: string;
  }[];
  draft: boolean;
}

export const getPreparedPulls = ({ owner, repo }: { owner: string, repo: string }) =>
  Promise.all([
    octokit.paginate(octokit.rest.pulls.list, { owner, repo, state: "open" }),
    octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc"
    }).then(resp => resp.data)
  ])
    .then(([open, closed]) => ({ open: open as PullObject[], closed: closed as PullObject[] }));


