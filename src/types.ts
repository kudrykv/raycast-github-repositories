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

export interface PullObject {
  url: string;
  id: number;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  html_url: string;
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
