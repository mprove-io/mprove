import { BmError } from '#blockml/classes/bm-error/bm-error';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';

import type { FileSpace } from '#common/types/blockml/parts/internal/file-space';

export function checkSpaceFolderElementsRecursive(item: {
  file: FileSpace;
  folders: any[];
  errors: BmError[];
}) {
  let { file, folders, errors } = item;

  folders.forEach(folder => {
    if (folder?.constructor !== Object) {
      errors.push(
        new BmError({
          title: 'SPACE_FOLDER_ELEMENT_IS_NOT_A_DICTIONARY',
          message: 'space folder element must be a dictionary',
          lines: [
            {
              line: file.folders_line_num,
              name: file.fileName,
              path: file.filePath
            }
          ]
        })
      );
      return;
    }

    let spaceParameter = 'space'.toString();
    let firstParameter = Object.keys(folder).find(
      x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
    );
    let firstLine = firstParameter
      ? folder[firstParameter + LINE_NUM]
      : file.folders_line_num;
    let isSpaceMissing = !Object.prototype.hasOwnProperty.call(
      folder,
      spaceParameter
    );

    if (isSpaceMissing === true) {
      errors.push(
        new BmError({
          title: 'MISSING_SPACE_FOLDER_SPACE',
          message: `parameter "${spaceParameter}" must exist in folders element of .space file`,
          lines: [
            {
              line: firstLine,
              name: file.fileName,
              path: file.filePath
            }
          ]
        })
      );
      return;
    }

    Object.keys(folder)
      .filter(x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            'space'.toString(),
            'title'.toString(),
            'access_roles'.toString(),
            'folders'.toString()
          ].indexOf(parameter) < 0
        ) {
          errors.push(
            new BmError({
              title: 'UNKNOWN_SPACE_PARAMETER',
              message:
                `parameter "${parameter}" cannot be used in ` +
                `folders element of .space file`,
              lines: [
                {
                  line: folder[parameter + LINE_NUM],
                  name: file.fileName,
                  path: file.filePath
                }
              ]
            })
          );
          return;
        }

        let isUnexpectedList =
          Array.isArray(folder[parameter]) &&
          ['access_roles'.toString(), 'folders'.toString()].indexOf(parameter) <
            0;

        if (isUnexpectedList === true) {
          errors.push(
            new BmError({
              title: 'UNEXPECTED_LIST',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: folder[parameter + LINE_NUM],
                  name: file.fileName,
                  path: file.filePath
                }
              ]
            })
          );
          return;
        }

        let isParameterNotAList =
          !Array.isArray(folder[parameter]) &&
          ['access_roles'.toString(), 'folders'.toString()].indexOf(parameter) >
            -1;

        if (isParameterNotAList === true) {
          errors.push(
            new BmError({
              title: 'PARAMETER_IS_NOT_A_LIST',
              message: `parameter "${parameter}" must be a List`,
              lines: [
                {
                  line: folder[parameter + LINE_NUM],
                  name: file.fileName,
                  path: file.filePath
                }
              ]
            })
          );
          return;
        }

        let isUnexpectedDictionary = folder[parameter]?.constructor === Object;

        if (isUnexpectedDictionary === true) {
          errors.push(
            new BmError({
              title: 'UNEXPECTED_DICTIONARY',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: folder[parameter + LINE_NUM],
                  name: file.fileName,
                  path: file.filePath
                }
              ]
            })
          );
          return;
        }

        if (parameter === 'folders'.toString()) {
          checkSpaceFolderElementsRecursive({
            file: file,
            folders: folder[parameter],
            errors: errors
          });
        }
      });
  });
}
