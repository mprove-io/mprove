import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import { drcType } from '#common/types/blockml/parts/internal/drc-type';

let func: Func = 'extra/check-access';

export function checkAccess<T extends drcType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isDefined(x.access_roles)) {
      x.access_roles.forEach(u => {
        if (typeof u !== 'string' && !(<any>u instanceof String)) {
          item.errors.push(
            new BmError({
              title: 'WRONG_ACCESS_ROLES_ELEMENT',
              message: 'found array element that is not a single value',
              lines: [
                {
                  line: x.access_roles_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return newEntities;
}
