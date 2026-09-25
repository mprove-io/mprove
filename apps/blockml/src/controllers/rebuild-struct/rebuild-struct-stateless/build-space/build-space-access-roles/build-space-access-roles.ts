import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

let func = FuncEnum.BuildSpaceAccessRoles;

export function buildSpaceAccessRoles(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, logItem);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Spaces, item.spaces);

  return Result.succeed(item.spaces);
}
