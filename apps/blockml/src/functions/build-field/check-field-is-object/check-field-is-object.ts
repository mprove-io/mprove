import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { sdrType } from '#common/types/sdr-type';

let func = FuncEnum.CheckFieldIsObject;

export function checkFieldIsObject<T extends sdrType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (isDefined(field) && field.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FIELD_IS_NOT_A_DICTIONARY,
            message: 'found at least one field that is not a dictionary',
            lines: [
              {
                line: x.fields_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    x.parameters.forEach(parameter => {
      if (isDefined(parameter) && parameter.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.PARAMETER_IS_NOT_A_DICTIONARY,
            message: 'found at least one parameter that is not a dictionary',
            lines: [
              {
                line: x.parameters_line_num,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return Result.succeed(newEntities);
}
