import { api } from '~blockml/barrels/api';
import { isDefined } from './is-defined';

export function toBoolean(x: string) {
  return isDefined(x) && x.match(api.MyRegex.TRUE()) ? true : false;
}
