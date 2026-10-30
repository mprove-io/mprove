import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';

export function getUnitAuthor(item: {
  filePath: string | undefined;
}): string | undefined {
  let { filePath } = item;

  let author: string | undefined;

  if (isDefined(filePath)) {
    let filePathArray: string[] = filePath.split('/');

    let usersFolderIndex: number = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;
  }

  return author;
}
