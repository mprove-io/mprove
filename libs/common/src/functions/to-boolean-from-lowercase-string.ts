import { MyRegex } from '#common/models/my-regex';
import { isDefined } from './is-defined';

export function toBooleanFromLowercaseString(x: string) {
  return isDefined(x) && x.match(MyRegex.TRUE()) ? true : false;
}
