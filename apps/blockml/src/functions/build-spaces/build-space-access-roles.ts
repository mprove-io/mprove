import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeAccessRolesCombined } from '#common/functions/space/make-access-roles-combined';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { log } from '../extra/log';

let func = FuncEnum.BuildSpaceAccessRoles;

export function buildSpaceAccessRoles(
  item: {
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.spaces.forEach(space => {
    let accessRolesInherited: AccessRoleCombined[] = [];

    let parts = space.space.split('.');
    parts.pop();

    let parentSpaceName = parts.length > 0 ? parts.join('.') : undefined;

    let isParentSpaceNameDefined = isDefined(parentSpaceName);

    while (isParentSpaceNameDefined) {
      let parentSpace = item.spaces.find(x => x.space === parentSpaceName);

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

      isParentSpaceNameDefined = isDefined(parentSpaceName);
    }

    space.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: space.access_roles ?? [],
      accessRolesInherited: accessRolesInherited
    });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Spaces, item.spaces);

  return item.spaces;
}
