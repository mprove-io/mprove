import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapReps(item: {
  projectId: string;
  structId: string;
  reps: interfaces.Rep[];
}) {
  let { projectId, structId, reps } = item;

  let apiReps: common.Rep[] = reps.map(x => {
    let rep: common.Rep = {
      projectId: projectId,
      structId: structId,
      repId: x.name,
      draft: false,
      creatorId: undefined,
      filePath: x.filePath,
      title: x.title,
      timezone: undefined,
      timeSpec: undefined,
      timeRangeFraction: undefined,
      columns: [],
      rows: x.rows.map(y => {
        let row: common.Row = {
          rowId: y.id,
          metricId: y.metric,
          params: y.params,
          records: []
        };
        return row;
      }),
      timeColumnsLength: undefined,
      timeColumnsLimit: undefined,
      isTimeColumnsLimitExceeded: false,
      serverTs: 1
    };
    return rep;
  });

  return apiReps;
}
