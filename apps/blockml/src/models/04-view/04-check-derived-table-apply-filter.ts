import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckDerivedTableApplyFilter;

export function checkDerivedTableApplyFilter(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newViews: common.FileView[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.derived_table)) {
      newViews.push(x);
      return;
    }

    let input = x.derived_table;

    let reg2 = common.MyRegex.CAPTURE_START_FIELD_TARGET_END();
    let r2;

    while ((r2 = reg2.exec(input))) {
      let start = r2[1];
      let fieldName = r2[2];
      let target = r2[3];
      let end = r2[4];

      let field = x.fields.find(f => f.name === fieldName);

      if (common.isUndefined(field)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.APPLY_FILTER_REFS_MISSING_FILTER,
            message: `Filter '${fieldName}' is missing or not valid`,
            lines: [
              {
                line: x.derived_table_line_num,
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
            title: common.ErTitleEnum.APPLY_FILTER_MUST_REFERENCE_A_FILTER,
            message: `Found field '${fieldName}' that is ${field.fieldClass}`,
            lines: [
              {
                line: x.derived_table_line_num,
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
      newViews.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, newViews);

  return newViews;
}
