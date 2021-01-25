import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.AwcCheckSingleRefs;

export function awcCheckSingleRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    let reg = api.MyRegex.CAPTURE_SINGLE_REF_G();
    let r;

    let references: string[] = [];

    while ((r = reg.exec(x.sql_always_where_calc))) {
      references.push(r[1]);
    }

    references.forEach(reference => {
      let referenceField = x.fields.find(f => f.name === reference);

      if (helper.isUndefined(referenceField)) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD,
            message: `field "${reference}" is missing or not valid`,
            lines: [
              {
                line: x.sql_always_where_calc_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (referenceField.fieldClass === api.FieldClassEnum.Filter) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER,
            message:
              `"${enums.ParameterEnum.SqlAlwaysWhereCalc}" can not reference filters. ` +
              `Found referencing "${reference}".`,
            lines: [
              {
                line: x.sql_always_where_calc_line_num,
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
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
