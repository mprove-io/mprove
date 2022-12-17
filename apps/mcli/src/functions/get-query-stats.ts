import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';

export function queriesToStats(item: {
  queries: common.Query[];
  started: number;
}) {
  let { queries, started } = item;

  let queriesStats: interfaces.QueriesStats = {
    started: started,
    running: queries.filter(q => q.status === common.QueryStatusEnum.Running)
      .length,
    completed: queries.filter(
      q => q.status === common.QueryStatusEnum.Completed
    ).length,
    error: queries.filter(q => q.status === common.QueryStatusEnum.Error)
      .length,
    canceled: queries.filter(q => q.status === common.QueryStatusEnum.Canceled)
      .length
  };

  return queriesStats;
}
