import { Octokit } from "octokit";
import { getPreferenceValues } from "@raycast/api";
import { PullObject, RepositoryObject } from "./types";

const octokit = new Octokit({ auth: (getPreferenceValues())["github-api-token"] });

export const getRepos = () =>
  octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, { per_page: 100, sort: "full_name", direction: "asc" })
    .then(list => list as RepositoryObject[]);


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


type State = "open" | "all" | "closed" | undefined;
type Sort = "created" | "updated" | "popularity" | "long-running" | undefined;

export const getPulls = ({
                           owner,
                           repo,
                           state = "open",
                           sort = "created"
                         }: { owner: string, repo: string, state?: State, sort?: Sort }): Promise<PullObject[]> =>
  octokit.paginate(octokit.rest.pulls.list, { owner, repo, state, sort }) as Promise<PullObject[]>;
