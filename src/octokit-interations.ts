import { Octokit } from "octokit";
import { getPreferenceValues } from "@raycast/api";

const GITHUB_API_TOKEN = "github-api-token";

const preferences = getPreferenceValues();
const octokit = new Octokit({ auth: preferences[GITHUB_API_TOKEN] });

interface GetReposParams {
  page: number;
  per_page: number;
}

interface RepositoryObject {
  full_name: string;
}

export const getRepos = (
  acc: RepositoryObject[] = [],
  { page, per_page }: GetReposParams = { page: 1, per_page: 100 }
): Promise<RepositoryObject[]> =>
  octokit.request("GET /user/repos", { per_page, page })
    .then(res => res.data as RepositoryObject[])
    .then(list => {
      const upd = [...acc, ...list];

      if (list.length < 100) {
        return upd;
      }

      return getRepos([...acc, ...list], { page: page + 1, per_page });
    });


