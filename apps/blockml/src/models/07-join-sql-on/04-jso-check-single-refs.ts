import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JsoCheckSingleRefs;

export function jsoCheckSingleRefs(
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

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let reg = api.MyRegex.CAPTURE_SINGLE_REF_G();
        let r;

        let references: string[] = [];

        while ((r = reg.exec(join.sql_on))) {
          references.push(r[1]);
        }

        references.forEach(reference => {
          let referenceField = x.fields.find(f => f.name === reference);

          if (helper.isUndefined(referenceField)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_MISSING_FIELD,
                message: `field "${reference}" is missing or not valid`,
                lines: [
                  {
                    line: join.sql_on_line_num,
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
                title: enums.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_FILTER,
                message:
                  `"${enums.ParameterEnum.SqlOn}" can not reference filters. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (referenceField.fieldClass === api.FieldClassEnum.Calculation) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_CALCULATION,
                message:
                  `"${enums.ParameterEnum.SqlOn}" can not reference calculations. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (referenceField.fieldClass === api.FieldClassEnum.Measure) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_MEASURE,
                message:
                  `"${enums.ParameterEnum.SqlOn}" can not reference measures. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
      });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
