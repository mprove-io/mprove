import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ModelField } from '#common/zod/blockml/model-field';

export function getCompLabel(item: { field: ModelField }): string {
  let { field } = item;

  let topLabelPrefix = `${field.topLabel} `;

  let groupLabel = isDefined(field.groupLabel) ? `${field.groupLabel} ` : '';

  let compLabel = `${topLabelPrefix}${groupLabel}${field.label}`;

  return compLabel;
}
