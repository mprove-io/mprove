import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { makeFilePartSpaces } from '../extra/make-file-part-spaces';
import { buildSpaceAccessRoles } from './build-space-access-roles';
import { buildSpaceFullTitles } from './build-space-full-titles';
import { checkSpaceFolders } from './check-space-folders';
import { checkSpaceParents } from './check-space-parents';

export function buildSpace(
  item: {
    spaces: FileSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): FilePartSpace[] {
  let fileSpaces = checkSpaceFolders(
    {
      spaces: item.spaces,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  let spaces = makeFilePartSpaces(
    {
      spaces: fileSpaces,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  spaces = checkSpaceParents(
    {
      spaces: spaces,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  spaces = buildSpaceFullTitles(
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
