import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import { log } from '../extra/log';

let func = FuncEnum.CheckStoreSpaces;

export function checkStoreSpaces(
  item: {
    stores: FileStore[];
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.stores.forEach(store => {
    let space: FilePartSpace | undefined;

    if (isDefined(store.space)) {
      space = item.spaces.find(x => x.space === store.space);

      if (isDefined(space) === false) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.SPACE_DOES_NOT_EXIST,
            message: `${ParameterEnum.Store} "${store.name}" references space "${store.space}" that does not exist`,
            lines: [
              {
                line: store.space_line_num,
                name: store.fileName,
                path: store.filePath
              }
            ]
          })
        );
      }
    }

    store.accessRolesCombined = [
      ...new Set([
        ...(space?.accessRolesCombined ?? []),
        ...(store.access_roles ?? [])
      ])
    ];
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, item.stores);

  return item.stores;
}
