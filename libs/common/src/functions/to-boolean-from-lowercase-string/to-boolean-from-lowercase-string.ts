import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';

export function toBooleanFromLowercaseString(x: string) {
  return isDefined(x) && x.match(MyRegex.TRUE()) ? true : false;
}
