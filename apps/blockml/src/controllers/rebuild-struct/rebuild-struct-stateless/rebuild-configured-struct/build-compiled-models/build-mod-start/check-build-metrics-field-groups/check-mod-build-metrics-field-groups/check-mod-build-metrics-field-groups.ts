import type { BmError } from '#blockml/classes/bm-error';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import { MPROVE_TAG_FIELD_GROUP } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';
import { checkGroupSuffix } from './check-group-suffix/check-group-suffix';

export function checkModBuildMetricsFieldGroups(item: {
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
