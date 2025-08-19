import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.SetImplicitLabel;

export function setImplicitLabel<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.entities.forEach((x: T) => {
    x.fields.forEach(field => {
      if (
        isUndefined(field.label) &&
        field.fieldClass !== FieldClassEnum.Time
      ) {
        field.label = field.name
          .split('_')
          .map(word => capitalizeFirstLetter(word))
          .join(' ');

        field.label_line_num = 0;
      }
    });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, item.entities);

  return item.entities;
}
