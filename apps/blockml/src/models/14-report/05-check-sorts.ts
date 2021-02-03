import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckSorts;

export function checkSorts<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      report.sortingsAry = [];

      if (helper.isUndefined(report.sorts)) {
        return;
      }

      report.sorts.split(',').forEach(part => {
        let reg = api.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G();
        let r = reg.exec(part);

        if (helper.isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_WRONG_SORTS_SYNTAX,
              message:
                `"${enums.ParameterEnum.Sorts}" can contain selected ` +
                'fields in form of "alias.field_name [desc]" separated by comma',
              lines: [
                {
                  line: report.sorts_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let sorter = r[1];
        let desc = r[2];

        if (report.select.findIndex(z => z === sorter) < 0) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_SORTS_REFS_UNSELECTED_FIELD,
              message:
                'We can sort only selected fields.' +
                `Found field "${sorter}" in "${enums.ParameterEnum.Sorts}" that ` +
                `is not in "${enums.ParameterEnum.Select}". `,
              lines: [
                {
                  line: report.sorts_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        report.sortingsAry.push({
          fieldId: sorter,
          desc: helper.isDefined(desc)
        });
      });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
