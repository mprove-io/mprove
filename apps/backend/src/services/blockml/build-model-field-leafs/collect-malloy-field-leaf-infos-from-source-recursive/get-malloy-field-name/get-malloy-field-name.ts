import type { FieldDef as MalloyFieldDef } from '@malloydata/malloy';
import { isDefined } from '#common/functions/is-defined/is-defined';
export function getMalloyFieldName(item: {
  fieldDef: MalloyFieldDef;
}): string | undefined {
  let { fieldDef } = item;
  let hasAs = 'as' in fieldDef && isDefined(fieldDef.as);
  if (hasAs === true) {
    return fieldDef.as;
  }
  let hasName = 'name' in fieldDef && isDefined(fieldDef.name);
  if (hasName === true) {
    return fieldDef.name;
  }
  return undefined;
}
