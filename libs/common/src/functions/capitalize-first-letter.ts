import { isDefined } from './is-defined';

export function capitalizeFirstLetter(value: string) {
  return isDefined(value) && value.length > 0
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;
}
