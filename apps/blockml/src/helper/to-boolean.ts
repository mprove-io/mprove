import { common } from '~blockml/barrels/common';
import { isDefined } from './is-defined';

export function toBoolean(x: string) {
  return isDefined(x) && x.match(common.MyRegex.TRUE()) ? true : false;
}
