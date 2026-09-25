import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import { MPROVE_TAG_FIELD_GROUP } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';

let func = FuncEnum.CheckBuildMetricsFieldGroups;

export function checkBuildMetricsFieldGroups(item: {
  mods: FileMod[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newMods: FileMod[] = [];

  item.mods.forEach(mod => {
    let errorsOnStart = item.errors.length;
    let fieldItems = mod.flatMalloyFieldItems;

    if (isUndefined(fieldItems)) {
      return;
    }

    checkModBuildMetricsFieldGroups({
      fieldItems: fieldItems,
      errors: item.errors
    });

    if (errorsOnStart === item.errors.length) {
      newMods.push(mod);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return Result.succeed(newMods);
}

function checkModBuildMetricsFieldGroups(item: {
  fieldItems: FlatMalloyFieldItem[];
  errors: BmError[];
}) {
  let groups: { groupName: string; fieldItems: FlatMalloyFieldItem[] }[] = [];

  item.fieldItems.forEach(fieldItem => {
    let tagsResult = parseTags({
      inputs:
        fieldItem.field.annotations?.map(annotation => annotation.value) || []
    });

    let fieldGroupTag = tagsResult.mproveTags.find(
      tag => tag.key === MPROVE_TAG_FIELD_GROUP
    );

    let buildMetricsTag = tagsResult.mproveTags.find(
      tag => tag.key === ParameterEnum.BuildMetrics
    );

    if (isUndefined(fieldGroupTag) || isUndefined(buildMetricsTag)) {
      return;
    }

    if (isUndefined(fieldGroupTag.value)) {
      return;
    }

    let groupIndex = groups.findIndex(g => g.groupName === fieldGroupTag.value);

    if (groupIndex < 0) {
      groups.push({
        groupName: fieldGroupTag.value,
        fieldItems: [fieldItem]
      });
    } else {
      groups[groupIndex].fieldItems.push(fieldItem);
    }
  });

  groups.forEach(group => {
    checkGroupSuffix({
      fieldItems: group.fieldItems,
      groupName: group.groupName,
      suffix: '_ts',
      title: ErTitleEnum.BUILD_METRICS_FIELD_GROUP_MISSING_FIELD_WITH_TS_SUFFIX,
      errors: item.errors
    });

    checkGroupSuffix({
      fieldItems: group.fieldItems,
      groupName: group.groupName,
      suffix: '_t',
      title: ErTitleEnum.BUILD_METRICS_FIELD_GROUP_MISSING_FIELD_WITH_T_SUFFIX,
      errors: item.errors
    });
  });
}

function checkGroupSuffix(item: {
  fieldItems: FlatMalloyFieldItem[];
  groupName: string;
  suffix: string;
  title: ErTitleEnum;
  errors: BmError[];
}) {
  let suffixFieldItems = item.fieldItems.filter(fieldItem =>
    fieldItem.field.name.endsWith(item.suffix)
  );

  if (suffixFieldItems.length === 1) {
    return;
  }

  let firstFieldItem = item.fieldItems[0];

  item.errors.push(
    new BmError({
      title: item.title,
      message: `"${ParameterEnum.BuildMetrics}" "${MPROVE_TAG_FIELD_GROUP}" group "${item.groupName}" must have exactly one field with "${item.suffix}" suffix`,
      lines: [
        {
          line: firstFieldItem.lineNum,
          name: firstFieldItem.fileName,
          path: firstFieldItem.filePath
        }
      ]
    })
  );
}
