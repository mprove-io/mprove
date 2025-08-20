import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { Query } from '~common/interfaces/blockml/query';
import { McliQueriesStats } from '~common/interfaces/mcli/mcli-queries-stats';

export function queriesToStats(item: {
  queries: Query[];
  started: number;
}) {
  let { queries, started } = item;

  let queriesStats: McliQueriesStats = {
    started: started,
    running: queries.filter(q => q.status === QueryStatusEnum.Running).length,
    completed: queries.filter(q => q.status === QueryStatusEnum.Completed)
      .length,
    error: queries.filter(q => q.status === QueryStatusEnum.Error).length,
    canceled: queries.filter(q => q.status === QueryStatusEnum.Canceled).length
  };

  return queriesStats;
}
