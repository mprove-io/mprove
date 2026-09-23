import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
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
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'fileSpaces',
      (v): Result.Result<FileSpace[], never> =>
        checkSpaceFolders({
          spaces: v.spaces,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'filePartSpaces',
      (v): Result.Result<FilePartSpace[], never> =>
        makeFilePartSpaces({
          spaces: v.fileSpaces,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'parentCheckedSpaces',
      (v): Result.Result<FilePartSpace[], never> =>
        checkSpaceParents({
          spaces: v.filePartSpaces,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'fullTitleSpaces',
      (v): Result.Result<FilePartSpace[], never> =>
        buildSpaceFullTitles({
          spaces: v.parentCheckedSpaces,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.andThen(
      (v): Result.Result<FilePartSpace[], never> =>
        buildSpaceAccessRoles({
          spaces: v.fullTitleSpaces,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}
