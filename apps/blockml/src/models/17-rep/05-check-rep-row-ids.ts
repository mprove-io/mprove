import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRowIds;

export function checkRepRowIds(
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

    let rowIds: Array<{ rowId: string; lineNumbers: number[] }> = [];

    x.rows.forEach(row => {
      let fName = rowIds.find(element => element.rowId === row.row_id);

      if (fName) {
        fName.lineNumbers.push(row.row_id_line_num);
      } else {
        rowIds.push({
          rowId: row.row_id,
          lineNumbers: [row.row_id_line_num]
        });
      }
    });

    rowIds.forEach(n => {
      if (n.lineNumbers.length > 1) {
        let lines: common.FileErrorLine[] = n.lineNumbers.map(y => ({
          line: y,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.DUPLICATE_ROW_IDS,
            message: 'Each row must have a unique row_id',
            lines: lines
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
