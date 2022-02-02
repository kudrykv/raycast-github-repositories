import { Octokit } from "octokit";
import { getPreferenceValues } from "@raycast/api";
import { PullObject, RepositoryObject, ReviewObject } from "./types";

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
    .then(([open, closed]) => ({ open: open as PullObject[], closed: closed as PullObject[] }))
    .then(({ open, closed }) =>
      Promise.all(open.map(pr => octokit.rest.pulls.listReviews({ owner, repo, pull_number: pr.number })))
        .then(arr => arr.map(resp => resp.data as ReviewObject[]))
        .then(ror => open.forEach((pr, idx) => pr.reviews = ror[idx]))
        .then(() => ({ open, closed }))
    );


type State = "open" | "all" | "closed" | undefined;
type Sort = "created" | "updated" | "popularity" | "long-running" | undefined;

interface PullsParams {
  owner: string;
  repo: string;
  state?: State;
  sort?: Sort;
}

export const getPulls = ({ owner, repo, state = "open", sort = "created" }: PullsParams): Promise<PullObject[]> =>
  Promise.resolve()
    .then(() => console.debug(`getPulls for ${owner}/${repo}, state ${state}, sort ${sort}`))
    .then(() => octokit.paginate(octokit.rest.pulls.list, { owner, repo, state, sort }) as Promise<PullObject[]>)
    .then(pulls =>
      Promise.all(pulls.map(({ number }) => octokit.rest.pulls.listReviews({ owner, repo, pull_number: number })))
        .then(arr => arr.map(resp => resp.data as ReviewObject[]))
        .then(ror => pulls.forEach((pr, idx) => pr.reviews = ror[idx]))
        .then(() => pulls)
    );
