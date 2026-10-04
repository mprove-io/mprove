import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';

let func: Func = 'build-store-next/check-store-spaces';

export function checkStoreSpaces(
  item: {
    stores: FileStore[];
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

  item.stores.forEach(store => {
    let space: FilePartSpace | undefined;

    if (isDefined(store.space)) {
      space = item.spaces.find(x => x.space === store.space);

      if (isDefined(space) === false) {
        item.errors.push(
          new BmError({
            title: 'SPACE_DOES_NOT_EXIST',
            message: `store "${store.name}" references space "${store.space}" that does not exist`,
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

    store.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: store.access_roles ?? [],
      accessRolesInherited: space?.accessRolesCombined ?? []
    });
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', item.stores);

  return item.stores;
}
