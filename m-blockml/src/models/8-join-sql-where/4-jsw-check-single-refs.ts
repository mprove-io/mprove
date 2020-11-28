import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.JswCheckSingleRefs;

export function jswCheckSingleRefs(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        if (helper.isUndefined(join.sql_where)) {
          return;
        }

        let reg = api.MyRegex.CAPTURE_SINGLE_REF_G();
        let r;

        let references: string[] = [];

        while ((r = reg.exec(join.sql_where))) {
          references.push(r[1]);
        }

        references.forEach(reference => {
          let referenceField = x.fields.find(f => f.name === reference);

          if (helper.isUndefined(referenceField)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MODEL_MISSING_FIELD,
                message: `field "${reference}" is missing or not valid`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else if (
            referenceField.fieldClass === enums.FieldClassEnum.Filter
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MODEL_FILTER,
                message:
                  `"${enums.ParameterEnum.SqlWhere}" can not reference filters. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else if (
            referenceField.fieldClass === enums.FieldClassEnum.Measure
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MODEL_MEASURE,
                message:
                  `"${enums.ParameterEnum.SqlWhere}" can not reference measures. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else if (
            referenceField.fieldClass === enums.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MODEL_CALCULATION,
                message:
                  `"${enums.ParameterEnum.SqlWhere}" can not reference calculations. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
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

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
