import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { buildSpaceAccessRoles } from './build-space-access-roles';
import { checkSpaceParents } from './check-space-parents';

export function buildSpace(
  item: {
    spaces: FileSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): FileSpace[] {
  let spaces = item.spaces;

  spaces = checkSpaceParents(
    {
      spaces: spaces,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  spaces = buildSpaceAccessRoles(
    {
      spaces: spaces,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  return spaces;
}
