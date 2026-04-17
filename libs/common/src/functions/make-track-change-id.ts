import type { Mconfig } from '#common/zod/blockml/mconfig';
import type { Query } from '#common/zod/blockml/query';

export function makeTrackChangeId(item: { mconfig: Mconfig; query: Query }) {
  let { mconfig, query } = item;

  let mconfigPart = Object.assign({}, mconfig, <Mconfig>{
    mconfigId: undefined,
    compiledQuery: undefined,
    serverTs: undefined
  });

  let mconfigPartStr = JSON.stringify(mconfigPart);

  let queryDataStr = JSON.stringify(query?.data ?? []);

  let trackChangeId = mconfigPartStr + queryDataStr;

  return trackChangeId;
}
