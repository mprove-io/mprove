import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import { checkSpaceValue } from './check-space-value/check-space-value';

export function checkSpaceFolderValuesRecursive(item: {
  file: any;
  rootFile: any;
  errors: BmError[];
}) {
  let { file, rootFile, errors } = item;

  if (!Array.isArray(file.folders)) {
    return;
  }

  file.folders.forEach((folder: any) => {
    if (folder?.constructor !== Object) {
      return;
    }

    if (folder['space' satisfies FileParameter]) {
      checkSpaceValue({
        file: Object.assign({}, folder, {
          name: rootFile.name,
          path: rootFile.path
        }),
        parameter: 'space' satisfies FileParameter,
        errors: errors,
        isAllowDots: false
      });
    }

    checkSpaceFolderValuesRecursive({
      file: folder,
      rootFile: rootFile,
      errors: errors
    });
  });
}
