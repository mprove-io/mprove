import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.TransformYesNoDimensions;

export function transformYesNoDimensions<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach((x: T) => {
    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      return;
    }

    x.fields.forEach(field => {
      if (
        field.fieldClass === common.FieldClassEnum.Dimension &&
        field.type === common.FieldTypeEnum.YesnoIsTrue
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
