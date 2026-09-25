import { NO_CAPITALIZE_LIST } from '#common/constants/top';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';

export function getLabel(item: { value: string }): string {
  let { value } = item;

  return value
    .split('_')
    .map(part =>
      NO_CAPITALIZE_LIST.indexOf(part) < 0 ? capitalizeFirstLetter(part) : part
    )
    .join(' ');
}
