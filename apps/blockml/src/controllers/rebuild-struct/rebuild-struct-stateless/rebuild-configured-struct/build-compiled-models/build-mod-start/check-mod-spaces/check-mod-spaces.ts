import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { KeyValuePair } from '#common/types/blockml/parts/tag/key-value-pair';

let func: Func = 'build-mod-start/check-mod-spaces';

export function checkModSpaces(item: {
  mods: FileMod[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  item.mods.forEach(mod => {
    let tagsResult = parseTags({
      inputs: mod.valueWithSourceInfo?.annotations?.map(x => x.value) || []
    });
    let mproveTags = tagsResult.mproveTags;

    let spaceTag: KeyValuePair = mproveTags.find(
      tag => tag.key === ('space' satisfies FileParameter)
    );
    let accessRolesTag: KeyValuePair = mproveTags.find(
      tag => tag.key === ('access_roles' satisfies FileParameter)
    );

    mod.space = isDefined(spaceTag?.value) ? spaceTag.value.trim() : undefined;
    mod.access_roles = isDefined(accessRolesTag?.value)
      ? accessRolesTag.value.split(',').map(x => x.trim())
      : (mod.access_roles ?? []);

    let space: FilePartSpace | undefined;

    if (isDefined(mod.space)) {
      space = item.spaces.find(x => x.space === mod.space);

      if (isDefined(space) === false) {
        item.errors.push(
          new BmError({
            title: 'SPACE_DOES_NOT_EXIST',
            message: `${'model' satisfies FileParameter} "${mod.name}" references space "${mod.space}" that does not exist`,
            lines: [
              {
                line: 0,
                name: mod.fileName,
                path: mod.filePath
              }
            ]
          })
        );
      }
    }

    mod.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: mod.access_roles ?? [],
      accessRolesInherited: space?.accessRolesCombined ?? []
    });
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', item.mods);

  return Result.succeed(item.mods);
}
