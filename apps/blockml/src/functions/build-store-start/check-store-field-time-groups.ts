import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFieldTimeGroup } from '~common/_index';

let func = FuncEnum.CheckStoreFieldTimeGroups;

export function checkStoreFieldTimeGroups(
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

    if (isUndefined(x.field_time_groups)) {
      x.field_time_groups = [];
    }

    let times: { timeName: string; timeLineNums: number[] }[] = [];

    x.field_time_groups.forEach(fieldTimeGroup => {
      if (isDefined(fieldTimeGroup) && fieldTimeGroup.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FIELD_TIME_GROUP_IS_NOT_A_DICTIONARY,
            message: `found at least one ${ParameterEnum.FieldTimeGroups} element that is not a dictionary`,
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
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.Time.toString(),
              ParameterEnum.Group.toString(),
              ParameterEnum.Label.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_FIELD_TIME_GROUP_PARAMETER,
                message: `parameter "${parameter}" cannot be used in ${ParameterEnum.FieldTimeGroups} element`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldTimeGroup
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
                title: ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldTimeGroup
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
                title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: fieldTimeGroup[
                      (parameter + LINE_NUM) as keyof FileStoreFieldTimeGroup
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
        if (isUndefined(fieldTimeGroup.time)) {
          let fieldTimeGroupKeysLineNums: number[] = Object.keys(fieldTimeGroup)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(
              y => fieldTimeGroup[y as keyof FileStoreFieldTimeGroup] as number
            )
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_TIME,
              message: `${ParameterEnum.FieldTimeGroups} element must have "${ParameterEnum.Time}" parameter`,
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

        if (isUndefined(fieldTimeGroup.group)) {
          fieldTimeGroup.group = MF;
        }

        if (
          [MF, ...x.field_groups.map(g => g.group)].indexOf(
            fieldTimeGroup.group
          ) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_GROUP,
              message: `specified ${ParameterEnum.Group} "${fieldTimeGroup.group}" is not found in ${ParameterEnum.FieldGroups}`,
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
              title: ErTitleEnum.DUPLICATE_TIME_NAMES,
              message: `"${ParameterEnum.Time}" value must be unique across ${ParameterEnum.FieldTimeGroups} elements`,
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

        let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_FIELD_TIME_GROUP_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(timeElement.timeName))) {
          timeWrongChars.push(r2[1]);
        }

        let timeWrongCharsString = '';

        if (timeWrongChars.length > 0) {
          timeWrongCharsString = [...new Set(timeWrongChars)].join(', '); // unique

          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_TIME_NAME,
              message: `Characters "${timeWrongCharsString}" cannot be used for time (only snake_case "a...z0...9_" is allowed)`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
