import { BmError } from '#blockml/classes/bm-error/bm-error';
import { MPROVE_TAG_FIELD_GROUP } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import type { ErTitleEnum } from '#common/enums/special/er-title.enum';
import type { FlatMalloyFieldItem } from '#common/zod/blockml/internal/flat-malloy-field-item';

export function checkGroupSuffix(item: {
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
