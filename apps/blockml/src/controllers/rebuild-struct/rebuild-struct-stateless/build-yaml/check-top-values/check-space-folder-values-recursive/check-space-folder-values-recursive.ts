import type { BmError } from '#blockml/classes/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
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

    if (folder[ParameterEnum.Space.toString()]) {
      checkSpaceValue({
        file: Object.assign({}, folder, {
          name: rootFile.name,
          path: rootFile.path
        }),
        parameter: ParameterEnum.Space.toString(),
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
