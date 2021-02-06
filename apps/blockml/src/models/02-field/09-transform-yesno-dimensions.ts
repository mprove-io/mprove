import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
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
        field.fieldClass === apiToBlockml.FieldClassEnum.Dimension &&
        field.type === apiToBlockml.FieldTypeEnum.YesnoIsTrue
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
