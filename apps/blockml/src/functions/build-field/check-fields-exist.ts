import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { sdrType } from '~common/types/sdr-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckFieldsExist;

export function checkFieldsExist<T extends sdrType>(
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

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (
      isUndefined(x.fields) &&
      [FileExtensionEnum.Store].indexOf(x.fileExt) > -1
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_FIELDS,
          message: `parameter "${ParameterEnum.Fields}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (isUndefined(x.fields)) {
      x.fields = [];
    }

    if (isUndefined(x.parameters)) {
      x.parameters = [];
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
