import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isUndefined } from '#common/functions/is-undefined';
import { sdrType } from '#common/types/sdr-type';
import { log } from '../extra/log';

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
