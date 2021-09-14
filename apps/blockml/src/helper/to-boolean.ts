import { common } from '~blockml/barrels/common';

export function toBooleanFromLowercaseString(x: string) {
  return common.isDefined(x) && x.match(common.MyRegex.TRUE()) ? true : false;
}
