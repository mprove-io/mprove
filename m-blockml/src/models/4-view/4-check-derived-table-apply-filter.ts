import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckDerivedTableApplyFilter;

export function checkDerivedTableApplyFilter(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isDefined(x.derived_table)) {
      let input = x.derived_table;

      let reg2 = api.MyRegex.CAPTURE_START_FIELD_TARGET_END();
      let r2;

      while ((r2 = reg2.exec(input))) {
        let start = r2[1];
        let fieldName = r2[2];
        let target = r2[3];
        let end = r2[4];

        let field = x.fields.find(f => f.name === fieldName);

        if (!field) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.APPLY_FILTER_REFERENCES_MISSING_FILTER,
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
        } else if (field.fieldClass !== enums.FieldClassEnum.Filter) {
          // error e251
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.APPLY_FILTER_MUST_REFERENCE_A_FILTER,
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
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
