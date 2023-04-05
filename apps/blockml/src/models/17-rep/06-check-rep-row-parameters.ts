import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRowParameters;

export function checkRepRowParameters(
  item: {
    reps: common.FileRep[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReps: common.FileRep[] = [];

  item.reps.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        let pFilterMaps: Array<{ filter: string; lineNumbers: number[] }> = [];

        row.parameters.forEach(p => {
          let pFilterMap = pFilterMaps.find(
            element => element.filter === p.filter
          );

          if (pFilterMap) {
            pFilterMap.lineNumbers.push(p.filter_line_num);
          } else {
            pFilterMaps.push({
              filter: p.filter,
              lineNumbers: [p.filter_line_num]
            });
          }
        });

        pFilterMaps.forEach(n => {
          if (n.lineNumbers.length > 1) {
            let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
              line: y,
              name: x.fileName,
              path: x.filePath
            }));

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DUPLICATE_FILTERS,
                message: 'Row filters must be unique',
                lines: lines
              })
            );
            return;
          }
        });
      });

    if (errorsOnStart === item.errors.length) {
      newReps.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Entities, newReps);

  return newReps;
}
