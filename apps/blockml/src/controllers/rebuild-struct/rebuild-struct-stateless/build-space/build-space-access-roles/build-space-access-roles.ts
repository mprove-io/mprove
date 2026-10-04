import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

let func: Func = 'build-spaces/build-space-access-roles';

export function buildSpaceAccessRoles(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', logItem);

  item.spaces.forEach(space => {
    let accessRolesInherited: AccessRoleCombined[] = [];

    let parts: string[] = space.space.split('.');

    parts.pop();

    let parentSpaceName = parts.length > 0 ? parts.join('.') : undefined;

    while (isDefined(parentSpaceName)) {
      let parentSpace: FilePartSpace = item.spaces.find(
        x => x.space === parentSpaceName
      );

      if (isDefined(parentSpace)) {
        accessRolesInherited = [
          ...accessRolesInherited,
          ...(parentSpace.access_roles ?? []).map(role => ({
            role: role,
            isDirect: false
          }))
        ];
      }

      parts = parentSpaceName.split('.');

      parts.pop();

      parentSpaceName = parts.length > 0 ? parts.join('.') : undefined;
    }

    space.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: space.access_roles ?? [],
      accessRolesInherited: accessRolesInherited
    });
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_spaces.log', item.spaces);

  return Result.succeed(item.spaces);
}
