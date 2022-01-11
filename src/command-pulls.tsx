import { List, showToast, ToastStyle } from "@raycast/api";
import { useEffect, useState } from "react";
import { getFavorites } from "./storage-favorites";
import { getPulls } from "./octokit-interations";
import { PullObject } from "./types";
import { PullItem } from "./ListPulls";

// noinspection JSUnusedGlobalSymbols
export default function CommandPulls() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<[string, PullObject[]][]>([]);

  useEffect(() => {
    getFavorites()
      .then(favs => Promise.all([
        Promise.resolve(favs),
        Promise.all(favs.map(fav => fav.split("/")).map(([owner, repo]) => getPulls({ owner, repo })))
      ]))
      .then(([favs, pulls]) => favs.map((fav, i) => ([fav, pulls[i]]) as [string, PullObject[]]))
      .then(merged => merged.filter(([, pulls]) => pulls.length > 0))
      .then(filtered => filtered.sort(([l], [r]) => l < r ? -1 : 1))
      .then(setState)
      .then(() => setIsLoading(false))
      .catch(e => showToast(ToastStyle.Failure, e.message));
  }, []);

  return <List isLoading={isLoading}>
    {state.map(([fav, pulls]) =>
      <List.Section key={fav} title={fav}>
        {pulls.map(pull => <PullItem key={pull.id} pull={pull} />)}
      </List.Section>
    )}
  </List>;
}
