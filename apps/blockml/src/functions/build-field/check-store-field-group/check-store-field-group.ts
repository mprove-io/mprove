import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MF } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';

let func: Func = 'build-field/check-store-field-group';

export function checkStoreFieldGroup(item: {
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileStore[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields
      .filter(field => field.fieldClass !== 'filter')
      .forEach(field => {
        if (isDefined(field.group) && isDefined(field.time_group)) {
          item.errors.push(
            new BmError({
              title: 'STORE_FIELD_MULTIPLE_GROUPS',
              message: `store field can have only one of the parameters group or time_group`,
              lines: [
                {
                  line: field.group_line_num,
                  name: x.fileName,
                  path: x.filePath
                },
                {
                  line: field.time_group_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          isDefined(field.group) &&
          (x as FileStore).field_groups.map(r => r.group).indexOf(field.group) <
            0
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_STORE_FIELD_GROUP',
              message: `field ${field.group} must be one of store field_groups`,
              lines: [
                {
                  line: field.group_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          isDefined(field.time_group) &&
          (x as FileStore).field_time_groups
            .map(r => r.time)
            .indexOf(field.time_group) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_STORE_FIELD_TIME_GROUP',
              message: `field ${field.time_group} must be one of store field_time_groups`,
              lines: [
                {
                  line: field.time_group_line_num,
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
      x.fields.forEach(field => {
        if (isUndefined(field.group)) {
          if (isDefined(field.time_group)) {
            let timeGroup = (x as FileStore).field_time_groups.find(
              tg => tg.time === field.time_group
            );
            field.group = isDefined(timeGroup.group) ? timeGroup.group : MF;
          } else {
            field.group = MF;
          }
        }

        if (isDefined(field.time_group)) {
          field.groupId = field.time_group;

          let timeGroup = x.field_time_groups.find(
            tg => tg.time === field.time_group
          );

          field.group_label =
            timeGroup.label ||
            MyRegex.replaceUnderscoresWithSpaces(timeGroup.time);
          //
          field.group = timeGroup.group;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
