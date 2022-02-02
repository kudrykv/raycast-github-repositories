import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { getPreparedPulls } from "./octokit-interations";
import { PullObject } from "./types";
import { PullItem } from "./components/PullItem";

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


