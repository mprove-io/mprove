import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckReportRowIds;

export function checkReportRowIds(
  item: {
    reports: FileReport[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
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
        let lines: FileErrorLine[] = n.lineNumbers.map(y => ({
          line: y,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.DUPLICATE_ROW_IDS,
            message: 'Each row must have a unique row_id',
            lines: lines
          })
        );
        return;
      }
    });

    if (item.errors.length === errorsOnStart) {
      x.rows.forEach(row => {
        if (!!row.row_id.match(MyRegex.CONTAINS_A_to_Z()) === false) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_ROW_ID,
              message: `parameter "${ParameterEnum.RowId}" must consist of characters A-Z`,
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
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
