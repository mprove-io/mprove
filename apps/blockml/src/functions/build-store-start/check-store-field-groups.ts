import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { FileStoreFieldGroup } from '#common/interfaces/blockml/internal/file-store-field-group';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckStoreFieldGroups;

export function checkStoreFieldGroups(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.field_groups)) {
      x.field_groups = [];
    }

    let groups: { groupName: string; groupLineNums: number[] }[] = [];

    x.field_groups.forEach(fieldGroup => {
      if (isDefined(fieldGroup) && fieldGroup.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FIELD_GROUP_IS_NOT_A_DICTIONARY,
            message: 'found at least one field group that is not a dictionary',
            lines: [
              {
                line: x.field_groups_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      Object.keys(fieldGroup)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.Group.toString(),
              ParameterEnum.Label.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_FIELD_GROUP_PARAMETER,
                message: `parameter "${parameter}" cannot be used in field_groups element`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldGroup
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(fieldGroup[parameter as keyof FileStoreFieldGroup])
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldGroup
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            fieldGroup[parameter as keyof FileStoreFieldGroup]?.constructor ===
            Object
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldGroup
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });

      if (errorsOnStart === item.errors.length) {
        if (isUndefined(fieldGroup.group)) {
          let fieldGroupKeysLineNums: number[] = Object.keys(fieldGroup)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => fieldGroup[y as keyof FileStoreFieldGroup] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_GROUP,
              message: `field group must have "${ParameterEnum.Group}" parameter`,
              lines: [
                {
                  line: Math.min(...fieldGroupKeysLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let index = groups.findIndex(
          group => group.groupName === fieldGroup.group
        );

        if (index > -1) {
          groups[index].groupLineNums.push(fieldGroup.group_line_num);
        } else {
          groups.push({
            groupName: fieldGroup.group,
            groupLineNums: [fieldGroup.group_line_num]
          });
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      groups.forEach(group => {
        if (group.groupLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.DUPLICATE_GROUPS,
              message: `"${ParameterEnum.Group}" value must be unique across field_groups elements`,
              lines: group.groupLineNums.map(l => ({
                line: l,
                name: x.fileName,
                path: x.filePath
              }))
            })
          );
          return;
        }

        //

        let groupWrongChars: string[] = [];

        let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_GROUP_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(group.groupName))) {
          groupWrongChars.push(r2[1]);
        }

        let groupWrongCharsString = '';

        if (groupWrongChars.length > 0) {
          groupWrongCharsString = [...new Set(groupWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_GROUP,
              message: `Characters "${groupWrongCharsString}" cannot be used for group (only snake_case "a...z0...9_" is allowed)`,
              lines: [
                {
                  line: group.groupLineNums[0],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return false;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
