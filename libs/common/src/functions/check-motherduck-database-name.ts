import { MyRegex } from '~common/models/my-regex';
import { isUndefined } from './is-undefined';

export function getMotherduckDatabaseWrongChars(item: {
  databaseName: string;
}): string[] {
  if (isUndefined(item.databaseName) || item.databaseName === '') {
    return null;
  }

  let wrongChars: string[] = [];

  let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_MOTHERDUCK_DATABASE_CHARS_G();
  let r2;

  while ((r2 = reg2.exec(item.databaseName.toString()))) {
    wrongChars.push(r2[1]);
  }

  return wrongChars;
}
