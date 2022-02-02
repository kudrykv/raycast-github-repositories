import { List } from "@raycast/api";
import { usePulls } from "./hooks/usePulls";
import { PullItem } from "./components/PullItem";

// noinspection JSUnusedGlobalSymbols
export default function CommandPulls() {
  const { isLoading, favPulls, reloadFavPulls } = usePulls();

  return <List isLoading={isLoading}>
    {favPulls.map(([fav, pulls]) =>
      <List.Section key={fav} title={fav}>
        {pulls.map(pull => <PullItem key={pull.id} pull={pull} onReload={reloadFavPulls} />)}
      </List.Section>
    )}
  </List>;
}
