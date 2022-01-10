import { Octokit } from "octokit";
import { getPreferenceValues } from "@raycast/api";
import { PullObject, RepositoryObject } from "./types";

const octokit = new Octokit({ auth: (getPreferenceValues())["github-api-token"] });

export const getRepos = () =>
  octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, { per_page: 100 })
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


