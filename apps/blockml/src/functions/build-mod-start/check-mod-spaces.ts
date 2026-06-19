import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { parseTags } from '#common/functions/parse-tags';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { KeyValuePair } from '#common/zod/blockml/key-value-pair';
import { log } from '../extra/log';

let func = FuncEnum.CheckModSpaces;

export function checkModSpaces(
  item: {
    mods: FileMod[];
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.mods.forEach(mod => {
    let tagsResult = parseTags({
      inputs: mod.valueWithSourceInfo?.annotations?.map(x => x.value) || []
    });
    let mproveTags = tagsResult.mproveTags;

    let spaceTag: KeyValuePair = mproveTags.find(
      tag => tag.key === ParameterEnum.Space
    );
    let accessRolesTag: KeyValuePair = mproveTags.find(
      tag => tag.key === ParameterEnum.AccessRoles
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
            title: ErTitleEnum.SPACE_DOES_NOT_EXIST,
            message: `${ParameterEnum.Model} "${mod.name}" references space "${mod.space}" that does not exist`,
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

    mod.accessRolesCombined = [
      ...new Set([
        ...(space?.accessRolesCombined ?? []),
        ...(mod.access_roles ?? [])
      ])
    ];
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, item.mods);

  return item.mods;
}
