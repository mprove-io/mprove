import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFieldTimeGroup } from '~common/_index';

let func = common.FuncEnum.CheckStoreFieldTimeGroups;

export function checkStoreFieldTimeGroups(
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

    if (common.isUndefined(x.field_time_groups)) {
      x.field_time_groups = [];
    }

    let times: { timeName: string; timeLineNums: number[] }[] = [];

    x.field_time_groups.forEach(fieldTimeGroup => {
      if (
        common.isDefined(fieldTimeGroup) &&
        fieldTimeGroup.constructor !== Object
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.FIELD_TIME_GROUP_IS_NOT_A_DICTIONARY,
            message: `found at least one ${common.ParameterEnum.FieldTimeGroups} element that is not a dictionary`,
            lines: [
              {
                line: x.field_time_groups_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      Object.keys(fieldTimeGroup)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Time.toString(),
              common.ParameterEnum.Group.toString(),
              common.ParameterEnum.Label.toString(),
              common.ParameterEnum.ShowIf.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_FIELD_TIME_GROUP_PARAMETER,
                message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.FieldTimeGroups} element`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldTimeGroup
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
            Array.isArray(
              fieldTimeGroup[parameter as keyof FileStoreFieldTimeGroup]
            )
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldTimeGroup
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
            fieldTimeGroup[parameter as keyof FileStoreFieldTimeGroup]
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreFieldTimeGroup
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
        if (common.isUndefined(fieldTimeGroup.time)) {
          let fieldTimeGroupKeysLineNums: number[] = Object.keys(fieldTimeGroup)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(
              y => fieldTimeGroup[y as keyof FileStoreFieldTimeGroup] as number
            )
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_TIME,
              message: `${common.ParameterEnum.FieldTimeGroups} element must have "${common.ParameterEnum.Time}" parameter`,
              lines: [
                {
                  line: Math.min(...fieldTimeGroupKeysLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let index = times.findIndex(
          timeGroup => timeGroup.timeName === fieldTimeGroup.time
        );

        if (index > -1) {
          times[index].timeLineNums.push(fieldTimeGroup.time_line_num);
        } else {
          times.push({
            timeName: fieldTimeGroup.time,
            timeLineNums: [fieldTimeGroup.time_line_num]
          });
        }

        if (common.isUndefined(fieldTimeGroup.group)) {
          fieldTimeGroup.group = common.MF;
        }

        if (
          x.field_groups.map(g => g.group).indexOf(fieldTimeGroup.group) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_GROUP,
              message: `specified ${common.ParameterEnum.Group} "${fieldTimeGroup.group}" is not found in ${common.ParameterEnum.FieldGroups}`,
              lines: [
                {
                  line: fieldTimeGroup.group_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      times.forEach(timeElement => {
        if (timeElement.timeLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DUPLICATE_TIME_NAMES,
              message: `"${common.ParameterEnum.Time}" value must be unique across ${common.ParameterEnum.FieldTimeGroups} elements`,
              lines: timeElement.timeLineNums.map(l => ({
                line: l,
                name: x.fileName,
                path: x.filePath
              }))
            })
          );
          return;
        }

        //

        let timeWrongChars: string[] = [];

        let reg2 =
          common.MyRegex.CAPTURE_NOT_ALLOWED_FIELD_TIME_GROUP_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(timeElement.timeName))) {
          timeWrongChars.push(r2[1]);
        }

        let timeWrongCharsString = '';

        if (timeWrongChars.length > 0) {
          timeWrongCharsString = [...new Set(timeWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHARS_IN_TIME_NAME,
              message: `Characters "${timeWrongCharsString}" can not be used for time (only snake_case "a...z0...9_" is allowed)`,
              lines: [
                {
                  line: timeElement.timeLineNums[0],
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
