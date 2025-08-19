import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { STORE_FIELD_DETAIL_VALUES } from '~common/constants/top';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { log } from '../extra/log';

let func = FuncEnum.CheckStoreFieldDetail;

export function checkStoreFieldDetail(
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

  let newEntities: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields
      .filter(field => field.fieldClass !== FieldClassEnum.Filter)
      .forEach(field => {
        if (isDefined(field.detail) && isUndefined(field.time_group)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.STORE_FIELD_DETAIL_WITHOUT_TIME_GROUP,
              message: `store field ${ParameterEnum.TimeGroup} must be specified if field ${ParameterEnum.Detail} specified`,
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
              title: ErTitleEnum.STORE_FIELD_WRONG_DETAIL,
              message: `store field ${ParameterEnum.Detail} value "${field.detail}" is not valid`,
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
            field.fieldClass !== FieldClassEnum.Filter &&
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
              title:
                ErTitleEnum.STORE_FIELD_DUPLICATE_PAIR_OF_DETAIL_AND_TIME_GROUP,
              message: `store field ${ParameterEnum.Detail} must be unique for each ${ParameterEnum.TimeGroup}`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
