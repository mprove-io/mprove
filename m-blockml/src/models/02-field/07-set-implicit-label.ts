import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.SetImplicitLabel;

export function setImplicitLabel<T extends types.vmdType>(
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
    x.fields.forEach(field => {
      if (
        helper.isUndefined(field.label) &&
        field.fieldClass !== api.FieldClassEnum.Time
      ) {
        field.label = field.name;
        field.label_line_num = 0;
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
