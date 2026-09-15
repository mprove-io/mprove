import { MyRegex } from '#common/classes/my-regex';
import { isDefined } from './is-defined';

export function toBooleanFromLowercaseString(x: string) {
  return isDefined(x) && x.match(MyRegex.TRUE()) ? true : false;
}
