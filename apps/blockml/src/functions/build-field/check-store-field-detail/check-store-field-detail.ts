import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { STORE_FIELD_DETAIL_VALUES } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';

let func: Func = 'build-field/check-store-field-detail';

export function checkStoreFieldDetail(item: {
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
        if (isDefined(field.detail) && isUndefined(field.time_group)) {
          item.errors.push(
            new BmError({
              title: 'STORE_FIELD_DETAIL_WITHOUT_TIME_GROUP',
              message: `store field time_group must be specified if field detail specified`,
              lines: [
                {
                  line: field.detail_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          isDefined(field.detail) &&
          STORE_FIELD_DETAIL_VALUES.indexOf(field.detail) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'STORE_FIELD_WRONG_DETAIL',
              message: `store field detail value "${field.detail}" is not valid`,
              lines: [
                {
                  line: field.detail_line_num,
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
      let pairs: {
        timeGroup: string;
        timeGroupLineNums: number[];
        detail: string;
        detailLineNums: number[];
      }[] = [];

      x.fields
        .filter(
          field =>
            field.fieldClass !== 'filter' &&
            isDefined(field.detail) &&
            isDefined(field.time_group)
        )
        .forEach(field => {
          let pair = pairs.find(
            p => p.timeGroup === field.time_group && p.detail === field.detail
          );

          if (isDefined(pair)) {
            pair.timeGroupLineNums.push(field.time_group_line_num);
            pair.detailLineNums.push(field.detail_line_num);
          } else {
            pair = {
              timeGroup: field.time_group,
              detail: field.detail,
              timeGroupLineNums: [field.time_group_line_num],
              detailLineNums: [field.detail_line_num]
            };

            pairs.push(pair);
          }
        });

      pairs
        .filter(pair => pair.timeGroupLineNums.length > 1)
        .forEach(pair => {
          item.errors.push(
            new BmError({
              title: 'STORE_FIELD_DUPLICATE_PAIR_OF_DETAIL_AND_TIME_GROUP',
              message: `store field detail must be unique for each time_group`,
              lines: [
                ...pair.timeGroupLineNums.map(y => ({
                  line: y,
                  name: x.fileName,
                  path: x.filePath
                })),
                ...pair.detailLineNums.map(y => ({
                  line: y,
                  name: x.fileName,
                  path: x.filePath
                }))
              ]
            })
          );
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
