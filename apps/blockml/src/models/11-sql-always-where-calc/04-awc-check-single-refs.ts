import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.AwcCheckSingleRefs;

export function awcCheckSingleRefs(
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
              common.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD,
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

      if (referenceField.fieldClass === common.FieldClassEnum.Filter) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER,
            message:
              `"${common.ParameterEnum.SqlAlwaysWhereCalc}" cannot reference filters. ` +
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
