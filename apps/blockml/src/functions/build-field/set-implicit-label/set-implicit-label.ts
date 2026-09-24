import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isUndefined } from '#common/functions/is-undefined';
import type { sdrType } from '#common/types/sdr-type';

let func = FuncEnum.SetImplicitLabel;

export function setImplicitLabel<T extends sdrType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { caller, structId, cs } = item;

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

  return Result.succeed(item.entities);
}
