import { common } from '~blockml/barrels/common';

export function toBoolean(x: string) {
  return common.isDefined(x) && x.match(common.MyRegex.TRUE()) ? true : false;
}
