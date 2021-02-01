import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.TransformYesNoDimensions;

export function transformYesNoDimensions<T extends types.vmType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach((x: T) => {
    if (x.fileExt === api.FileExtensionEnum.Dashboard) {
      return;
    }

    x.fields.forEach(field => {
      if (
        field.fieldClass === api.FieldClassEnum.Dimension &&
        field.type === api.FieldTypeEnum.YesnoIsTrue
      ) {
        field.sql = `CASE WHEN (${field.sql}) IS TRUE THEN 'Yes' ELSE 'No' END`;
      }
    });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    item.entities
  );

  return item.entities;
}
