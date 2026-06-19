import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { buildSpaceAccessRoles } from './build-space-access-roles';
import { checkSpaceParents } from './check-space-parents';

export function buildSpace(
  item: {
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): FilePartSpace[] {
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
