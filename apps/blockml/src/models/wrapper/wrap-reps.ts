import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapReps(item: { structId: string; reps: interfaces.Rep[] }) {
  let { structId, reps } = item;

  let apiReps: common.Rep[] = reps.map(x => {
    let rep: common.Rep = {
      structId: structId,
      repId: x.name,
      filePath: x.filePath,
      title: x.title,
      timezone: x.timezone,
      timeSpec: x.time_spec,
      timeRange: x.time_range,
      rows: x.rows.map(y => {
        let row: common.Row = {
          rowId: y.id,
          metricId: y.metric,
          params: y.params,
          records: []
        };
        return row;
      }),
      serverTs: 1
    };
    return rep;
  });

  return apiReps;
}
