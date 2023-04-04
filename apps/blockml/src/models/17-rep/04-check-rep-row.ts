import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRow;

export function checkRepRow(
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

    x.rows.forEach(row => {
      let rowKeysLineNums: number[] = Object.keys(row)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => row[y as keyof common.FileRepRow] as number);

      if (common.isUndefined(row.row_id)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_ID,
            message: `parameter "${common.ParameterEnum.RowId}" is required for a row`,
            lines: [
              {
                line: Math.min(...rowKeysLineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
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
