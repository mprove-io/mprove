import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.TransformYesNoDimensions;

export function transformYesNoDimensions<T extends types.vmType>(
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

  item.entities.forEach((x: T) => {
    if (
      x.fileExt === common.FileExtensionEnum.Dashboard ||
      x.fileExt === common.FileExtensionEnum.Report
    ) {
      return;
    }

    x.fields.forEach(field => {
      if (
        field.fieldClass === common.FieldClassEnum.Dimension &&
        field.type === common.FieldTypeEnum.YesnoIsTrue
      ) {
        if (
          [
            common.ConnectionTypeEnum.BigQuery,
            common.ConnectionTypeEnum.PostgreSQL
          ].indexOf(x.connection.type) > -1
        ) {
          field.sql = `CASE WHEN (${field.sql}) IS TRUE THEN 'Yes' ELSE 'No' END`;
        } else if (
          [
            common.ConnectionTypeEnum.ClickHouse,
            common.ConnectionTypeEnum.SnowFlake
          ].indexOf(x.connection.type) > -1
        ) {
          field.sql = `CASE WHEN (${field.sql}) THEN 'Yes' ELSE 'No' END`;
        }
      }
    });
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
    item.entities
  );

  return item.entities;
}
