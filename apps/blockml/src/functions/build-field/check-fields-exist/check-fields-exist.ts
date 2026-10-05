import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';

let func: Func = 'build-field/check-fields-exist';

export function checkFieldsExist<T extends sdrType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.fields) && x.fileExt === '.store') {
      item.errors.push(
        new BmError({
          title: 'MISSING_FIELDS',
          message: `parameter "${'fields' satisfies FileParameter}" is required for ${x.fileExt} file`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
