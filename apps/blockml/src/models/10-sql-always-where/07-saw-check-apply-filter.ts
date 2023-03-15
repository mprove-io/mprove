import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.SawCheckApplyFilter;

export function sawCheckApplyFilter(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.sql_always_where)) {
      newModels.push(x);
      return;
    }

    let input = x.sql_always_where;

    let reg = common.MyRegex.CAPTURE_START_FIELD_TARGET_END();
    let r;

    while ((r = reg.exec(input))) {
      let start = r[1];
      let fieldName = r[2];
      let target = r[3];
      let end = r[4];

      let field = x.fields.find(f => f.name === fieldName);

      if (common.isUndefined(field)) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum
                .SQL_ALWAYS_WHERE_APPLY_FILTER_REFS_MISSING_FILTER,
            message: `Filter "${fieldName}" is missing or not valid`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (field.fieldClass !== common.FieldClassEnum.Filter) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum
                .SQL_ALWAYS_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER,
            message: `Found field "${fieldName}" that is ${field.fieldClass}`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      input = start + end;
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
