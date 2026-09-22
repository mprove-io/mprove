import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { makeFilePartSpaces } from '../extra/make-file-part-spaces';
import { buildSpaceAccessRoles } from './build-space-access-roles';
import { buildSpaceFullTitles } from './build-space-full-titles';
import { checkSpaceFolders } from './check-space-folders';
import { checkSpaceParents } from './check-space-parents';

export function buildSpace(item: {
  spaces: FileSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { spaces: inputSpaces, errors, structId, caller, cs } = item;

  let fileSpaces: FileSpace[] = checkSpaceFolders(
    {
      spaces: inputSpaces,
      errors: errors,
      structId: structId,
      caller: caller
    },
    cs
  );

  let spaces: FilePartSpace[] = makeFilePartSpaces(
    {
      spaces: fileSpaces,
      structId: structId,
      caller: caller
    },
    cs
  );

  spaces = checkSpaceParents(
    {
      spaces: spaces,
      errors: errors,
      structId: structId,
      caller: caller
    },
    cs
  );

  spaces = buildSpaceFullTitles(
    {
      spaces: spaces,
      errors: errors,
      structId: structId,
      caller: caller
    },
    cs
  );

  spaces = buildSpaceAccessRoles(
    {
      spaces: spaces,
      errors: errors,
      structId: structId,
      caller: caller
    },
    cs
  );

  return Result.succeed(spaces);
}
