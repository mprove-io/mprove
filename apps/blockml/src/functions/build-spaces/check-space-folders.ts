import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { MyRegex } from '#common/models/my-regex';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { log } from '../extra/log';

let func = FuncEnum.CheckSpaceFolders;

export function checkSpaceFolders(
  item: {
    spaces: FileSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): FileSpace[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newSpaces: FileSpace[] = [];

  item.spaces.forEach(space => {
    let errorsOnStart = item.errors.length;
    let isFoldersArray = Array.isArray(space.folders);

    if (isFoldersArray === true) {
      checkSpaceFolderElements({
        file: space,
        folders: space.folders,
        errors: item.errors
      });
    }

    if (errorsOnStart === item.errors.length) {
      newSpaces.push(space);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Spaces, newSpaces);

  return newSpaces;
}

function checkSpaceFolderElements(item: {
  file: FileSpace;
  folders: any[];
  errors: BmError[];
}) {
  let { file, folders, errors } = item;

  folders.forEach(folder => {
    if (folder?.constructor !== Object) {
      errors.push(
        new BmError({
          title: ErTitleEnum.SPACE_FOLDER_ELEMENT_IS_NOT_A_DICTIONARY,
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

    let spaceParameter = ParameterEnum.Space.toString();
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
          title: ErTitleEnum.MISSING_SPACE_FOLDER_SPACE,
          message: `parameter "${spaceParameter}" must exist in ${ParameterEnum.Folders} element of ${FileExtensionEnum.Space} file`,
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
            ParameterEnum.Space.toString(),
            ParameterEnum.Title.toString(),
            ParameterEnum.AccessRoles.toString(),
            ParameterEnum.Folders.toString()
          ].indexOf(parameter) < 0
        ) {
          errors.push(
            new BmError({
              title: ErTitleEnum.UNKNOWN_SPACE_PARAMETER,
              message:
                `parameter "${parameter}" cannot be used in ` +
                `${ParameterEnum.Folders} element of ${FileExtensionEnum.Space} file`,
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
          [
            ParameterEnum.AccessRoles.toString(),
            ParameterEnum.Folders.toString()
          ].indexOf(parameter) < 0;

        if (isUnexpectedList === true) {
          errors.push(
            new BmError({
              title: ErTitleEnum.UNEXPECTED_LIST,
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
          [
            ParameterEnum.AccessRoles.toString(),
            ParameterEnum.Folders.toString()
          ].indexOf(parameter) > -1;

        if (isParameterNotAList === true) {
          errors.push(
            new BmError({
              title: ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
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
              title: ErTitleEnum.UNEXPECTED_DICTIONARY,
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

        if (parameter === ParameterEnum.Folders.toString()) {
          checkSpaceFolderElements({
            file: file,
            folders: folder[parameter],
            errors: errors
          });
        }
      });
  });
}
