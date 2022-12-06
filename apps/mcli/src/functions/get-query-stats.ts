import { common } from '~mcli/barrels/common';

export function queriesToStats(queries: common.Query[]) {
  return {
    completed: queries.filter(
      q => q.status === common.QueryStatusEnum.Completed
    ).length,
    error: queries.filter(q => q.status === common.QueryStatusEnum.Error)
      .length,
    running: queries.filter(q => q.status === common.QueryStatusEnum.Running)
      .length,
    canceled: queries.filter(q => q.status === common.QueryStatusEnum.Canceled)
      .length
  };
}
