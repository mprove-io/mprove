import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckMeasures;

export function checkMeasures<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      if (field.fieldClass !== common.FieldClassEnum.Measure) {
        return;
      }

      if (common.isUndefined(field.type)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_TYPE_FOR_MEASURE,
            message: `parameter "${common.ParameterEnum.Type}" is required for measures`,
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
      } else if (common.MEASURE_TYPE_VALUES.indexOf(field.type) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_MEASURE_TYPE,
            message: `"${field.type}" value is not valid ${common.ParameterEnum.Type} for measure`,
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
          common.FieldTypeEnum.SumByKey,
          common.FieldTypeEnum.AverageByKey,
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_SQL_KEY,
            message: `parameter "${common.ParameterEnum.SqlKey}" is required for measure of type "${field.type}"`,
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

      if (
        x.connection.type === common.ConnectionTypeEnum.SnowFlake &&
        [
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum.MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION,
            message:
              `${common.ParameterEnum.Measure} type "${field.type}" is not supported for ` +
              `"${x.connection.type}". Consider using a "${common.FieldTypeEnum.Custom}" type.`,
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

      if (
        x.connection.type === common.ConnectionTypeEnum.ClickHouse &&
        [
          common.FieldTypeEnum.SumByKey,
          common.FieldTypeEnum.AverageByKey,
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum.MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION,
            message:
              `${common.ParameterEnum.Measure} type "${field.type}" is not supported for ` +
              `"${x.connection.type}". Consider using a "${common.FieldTypeEnum.Custom}" type.`,
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

      if (
        x.connection.type === common.ConnectionTypeEnum.PostgreSQL &&
        [
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum.MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION,
            message:
              `${common.ParameterEnum.Measure} type "${field.type}" is not supported for ` +
              `"${x.connection.type}". Consider using a "${common.FieldTypeEnum.Custom}" type.`,
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

      if (
        common.isDefined(field.percentile) &&
        [
          common.ConnectionTypeEnum.ClickHouse,
          common.ConnectionTypeEnum.PostgreSQL,
          common.ConnectionTypeEnum.SnowFlake
        ].indexOf(x.connection.type) > -1
      ) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum.PERCENTILE_IS_NOT_SUPPORTED_FOR_CONNECTION,
            message: `consider using a "${common.FieldTypeEnum.Custom}" type for ${common.ParameterEnum.Measure}`,
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

      if (field.type === common.FieldTypeEnum.PercentileByKey) {
        if (common.isUndefined(field.percentile)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_PERCENTILE,
              message: `parameter "${common.ParameterEnum.Percentile}" is required for ${common.ParameterEnum.Measure} of type ${field.type}`,
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
                title: common.ErTitleEnum.WRONG_PERCENTILE,
                message: `${common.ParameterEnum.Percentile} value must be integer between 1 and 99`,
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
            title: common.ErTitleEnum.MEASURE_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${common.FieldClassEnum.Measure} ${common.ParameterEnum.Sql} must have a BlockML reference to ${common.FieldClassEnum.Dimension}`,
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
            title: common.ErTitleEnum.MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE,
            message: `${common.FieldClassEnum.Measure} ${common.ParameterEnum.SqlKey} must have a BlockML reference to ${common.FieldClassEnum.Dimension}`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
