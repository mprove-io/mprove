import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcCheckSingleRefs;

export function awcCheckSingleRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    let reg = common.MyRegex.CAPTURE_SINGLE_REF_G();
    let r;

    let references: string[] = [];

    while ((r = reg.exec(x.sql_always_where_calc))) {
      references.push(r[1]);
    }

    references.forEach(reference => {
      let referenceField = x.fields.find(f => f.name === reference);

      if (common.isUndefined(referenceField)) {
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

      if (referenceField.fieldClass === apiToBlockml.FieldClassEnum.Filter) {
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