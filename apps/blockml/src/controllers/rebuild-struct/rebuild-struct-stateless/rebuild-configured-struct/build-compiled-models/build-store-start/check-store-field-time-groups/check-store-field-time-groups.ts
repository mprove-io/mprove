import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MF } from '#common/constants/top';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreFieldTimeGroup } from '#common/types/blockml/parts/internal/file-store-field-time-group';

let func: Func = 'build-store-start/check-store-field-time-groups';

export function checkStoreFieldTimeGroups(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
            title: 'FIELD_TIME_GROUP_IS_NOT_A_DICTIONARY',
            message: `found at least one field_time_groups element that is not a dictionary`,
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
            ['time'.toString(), 'group'.toString(), 'label'.toString()].indexOf(
              parameter
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNKNOWN_FIELD_TIME_GROUP_PARAMETER',
                message: `parameter "${parameter}" cannot be used in field_time_groups element`,
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
                title: 'UNEXPECTED_LIST',
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
                title: 'UNEXPECTED_DICTIONARY',
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
              title: 'MISSING_TIME',
              message: `field_time_groups element must have "time" parameter`,
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
              title: 'WRONG_GROUP',
              message: `specified group "${fieldTimeGroup.group}" is not found in field_groups`,
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
              title: 'DUPLICATE_TIME_NAMES',
              message: `"time" value must be unique across field_time_groups elements`,
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
              title: 'WRONG_CHARS_IN_TIME_NAME',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', newStores);

  return newStores;
}
