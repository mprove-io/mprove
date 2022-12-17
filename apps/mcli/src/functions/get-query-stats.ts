import { common } from '~mcli/barrels/common';

export function queriesToStats(item: {
  queries: common.Query[];
  started: number;
}) {
  let { queries, started } = item;

  return {
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
}
