import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckMeasures;

export function checkMeasures<T extends types.vmType>(
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

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      if (field.fieldClass !== apiToBlockml.FieldClassEnum.Measure) {
        return;
      }

      if (common.isUndefined(field.type)) {
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
          apiToBlockml.FieldTypeEnum.CountDistinct,
          apiToBlockml.FieldTypeEnum.SumByKey,
          apiToBlockml.FieldTypeEnum.AverageByKey,
          apiToBlockml.FieldTypeEnum.MedianByKey,
          apiToBlockml.FieldTypeEnum.PercentileByKey,
          apiToBlockml.FieldTypeEnum.Min,
          apiToBlockml.FieldTypeEnum.Max,
          apiToBlockml.FieldTypeEnum.List,
          apiToBlockml.FieldTypeEnum.Custom
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
          apiToBlockml.FieldTypeEnum.SumByKey,
          apiToBlockml.FieldTypeEnum.AverageByKey,
          apiToBlockml.FieldTypeEnum.MedianByKey,
          apiToBlockml.FieldTypeEnum.PercentileByKey
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

      if ([common.ConnectionTypeEnum.BigQuery].indexOf(x.connection.type) < 0) {
        if (
          field.type === apiToBlockml.FieldTypeEnum.MedianByKey ||
          field.type === apiToBlockml.FieldTypeEnum.PercentileByKey
        ) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum.MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION,
              message:
                `${enums.ParameterEnum.Measure} type "${field.type}" is not supported for ` +
                `"${x.connection.type}". Consider using a "${apiToBlockml.FieldTypeEnum.Custom}" type.`,
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

        if (common.isDefined(field.percentile)) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum.PERCENTILE_IS_NOT_SUPPORTED_FOR_CONNECTION,
              message: `consider using a "${apiToBlockml.FieldTypeEnum.Custom}" type for ${enums.ParameterEnum.Measure}`,
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

      if (field.type === apiToBlockml.FieldTypeEnum.PercentileByKey) {
        if (common.isUndefined(field.percentile)) {
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
          let reg = common.MyRegex.DIGITS_1_TO_99_G();

          let r = reg.exec(field.percentile);

          if (common.isUndefined(r)) {
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
        common.isDefined(field.sql) &&
        !field.sql.match(common.MyRegex.CONTAINS_BLOCKML_REF())
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MEASURE_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${apiToBlockml.FieldClassEnum.Measure} ${enums.ParameterEnum.Sql} must have a BlockML reference to ${apiToBlockml.FieldClassEnum.Dimension}`,
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
        common.isDefined(field.sql_key) &&
        !field.sql_key.match(common.MyRegex.CONTAINS_BLOCKML_REF())
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE,
            message: `${apiToBlockml.FieldClassEnum.Measure} ${enums.ParameterEnum.SqlKey} must have a BlockML reference to ${apiToBlockml.FieldClassEnum.Dimension}`,
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