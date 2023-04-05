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

    let rowIdMaps: Array<{ rowId: string; lineNumbers: number[] }> = [];

    x.rows.forEach(row => {
      let rowIdMap = rowIdMaps.find(element => element.rowId === row.row_id);

      if (rowIdMap) {
        rowIdMap.lineNumbers.push(row.row_id_line_num);
      } else {
        rowIdMaps.push({
          rowId: row.row_id,
          lineNumbers: [row.row_id_line_num]
        });
      }
    });

    rowIdMaps.forEach(n => {
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

    if (item.errors.length === errorsOnStart) {
      x.rows.forEach(row => {
        if (!!row.row_id.match(common.MyRegex.CONTAINS_A_to_Z()) === false) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHARS_IN_ROW_ID,
              message: `parameter "${common.ParameterEnum.RowId}" must consist of characters A-Z`,
              lines: [
                {
                  line: row.row_id_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

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
