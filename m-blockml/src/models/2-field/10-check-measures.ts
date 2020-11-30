import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckMeasures;

export function checkMeasures<T extends types.vmType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass !== enums.FieldClassEnum.Measure) {
        return;
      }

      if (helper.isUndefined(field.type)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_TYPE_FOR_MEASURE,
            message: `parameter "${enums.ParameterEnum.Type}" is required for measures`,
            lines: [
              {
                line: field.name_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      } else if (
        [
          enums.FieldAnyTypeEnum.CountDistinct,
          enums.FieldAnyTypeEnum.SumByKey,
          enums.FieldAnyTypeEnum.AverageByKey,
          enums.FieldAnyTypeEnum.MedianByKey,
          enums.FieldAnyTypeEnum.PercentileByKey,
          enums.FieldAnyTypeEnum.Min,
          enums.FieldAnyTypeEnum.Max,
          enums.FieldAnyTypeEnum.List,
          enums.FieldAnyTypeEnum.Custom
        ].indexOf(field.type) < 0
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_MEASURE_TYPE,
            message: `"${field.type}" value is not valid ${enums.ParameterEnum.Type} for measure`,
            lines: [
              {
                line: field.type_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      } else if (
        !field.sql_key &&
        [
          enums.FieldAnyTypeEnum.SumByKey,
          enums.FieldAnyTypeEnum.AverageByKey,
          enums.FieldAnyTypeEnum.MedianByKey,
          enums.FieldAnyTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_SQL_KEY,
            message: `parameter "${enums.ParameterEnum.SqlKey}" is required for measure of type "${field.type}"`,
            lines: [
              {
                line: field.name_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if ([api.ConnectionTypeEnum.BigQuery].indexOf(x.connection.type) < 0) {
        if (
          field.type === enums.FieldAnyTypeEnum.MedianByKey ||
          field.type === enums.FieldAnyTypeEnum.PercentileByKey
        ) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum.MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION,
              message: `consider using a "${enums.FieldAnyTypeEnum.Custom}" type for ${enums.ParameterEnum.Measure}`,
              lines: [
                {
                  line: field.type_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isDefined(field.percentile)) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum.PERCENTILE_IS_NOT_SUPPORTED_FOR_CONNECTION,
              message: `consider using a "${enums.FieldAnyTypeEnum.Custom}" type for ${enums.ParameterEnum.Measure}`,
              lines: [
                {
                  line: field.percentile_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      }

      if (field.type === enums.FieldAnyTypeEnum.PercentileByKey) {
        if (helper.isUndefined(field.percentile)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISSING_PERCENTILE,
              message: `parameter "${enums.ParameterEnum.Percentile}" is required for ${enums.ParameterEnum.Measure} of type ${field.type}`,
              lines: [
                {
                  line: field.name_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          let reg = api.MyRegex.DIGITS_1_TO_99_G();

          let r = reg.exec(field.percentile);

          if (helper.isUndefined(r)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_PERCENTILE,
                message: `${enums.ParameterEnum.Percentile} value must be integer between 1 and 99`,
                lines: [
                  {
                    line: field.percentile_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }
      }

      if (
        helper.isDefined(field.sql) &&
        !field.sql.match(api.MyRegex.CONTAINS_BLOCKML_REF())
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MEASURE_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${enums.FieldClassEnum.Measure} ${enums.ParameterEnum.Sql} must have a BlockML reference to ${enums.FieldClassEnum.Dimension}`,
            lines: [
              {
                line: field.sql_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        helper.isDefined(field.sql_key) &&
        !field.sql_key.match(api.MyRegex.CONTAINS_BLOCKML_REF())
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE,
            message: `${enums.FieldClassEnum.Measure} ${enums.ParameterEnum.SqlKey} must have a BlockML reference to ${enums.FieldClassEnum.Dimension}`,
            lines: [
              {
                line: field.sql_key_line_num,
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
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
