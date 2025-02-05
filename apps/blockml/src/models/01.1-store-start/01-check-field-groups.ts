import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFieldGroup } from '~common/_index';

let func = common.FuncEnum.CheckFieldGroups;

export function checkFieldGroups(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.field_groups)) {
      x.field_groups = [];
    }

    let groups: { group: string; groupLineNums: number[] }[] = [];

    x.field_groups.forEach(fieldGroup => {
      if (common.isDefined(fieldGroup) && fieldGroup.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.FIELD_GROUP_IS_NOT_A_DICTIONARY,
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
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Group.toString(),
              common.ParameterEnum.Label.toString(),
              common.ParameterEnum.ShowIf.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_FIELD_GROUP_PARAMETER,
                message: `parameter "${parameter}" can not be used in field_group element`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldGroup
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
                title: common.ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldGroup
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
                title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldGroup
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

      if (
        common.isUndefined(fieldGroup.group) &&
        errorsOnStart === item.errors.length
      ) {
        let fieldKeysLineNums: number[] = Object.keys(fieldGroup)
          .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .map(y => fieldGroup[y as keyof FileStoreFieldGroup] as number);

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_GROUP,
            message: 'field group must have "group" parameter',
            lines: [
              {
                line: Math.min(...fieldKeysLineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      // TODO: show_if check
    });

    if (errorsOnStart === item.errors.length) {
      groups.forEach(group => {
        if (group.groupLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DUPLICATE_GROUPS,
              message: `"${common.ParameterEnum.Group}" value must be unique across field_groups elements`,
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

        let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_GROUP_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(group.group))) {
          groupWrongChars.push(r2[1]);
        }

        let groupWrongCharsString = '';

        if (groupWrongChars.length > 0) {
          groupWrongCharsString = [...new Set(groupWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHARS_IN_GROUP,
              message: `Characters "${groupWrongCharsString}" can not be used for group (only snake_case "a...z0...9_" is allowed)`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
