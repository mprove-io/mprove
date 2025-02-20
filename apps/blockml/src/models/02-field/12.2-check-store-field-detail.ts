import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreFieldDetail;

export function checkStoreFieldDetail(
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

  let newEntities: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields
      .filter(field => field.fieldClass !== common.FieldClassEnum.Filter)
      .forEach(field => {
        if (
          common.isDefined(field.detail) &&
          common.isUndefined(field.time_group)
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.STORE_FIELD_DETAIL_WITHOUT_TIME_GROUP,
              message: `store field ${common.ParameterEnum.TimeGroup} must be specified if field ${common.ParameterEnum.Detail} specified`,
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
          common.isDefined(field.detail) &&
          common.STORE_FIELD_DETAIL_VALUES.indexOf(field.detail) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.STORE_FIELD_WRONG_DETAIL,
              message: `store field ${common.ParameterEnum.Detail} value "${field.detail}" is not valid`,
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
            field.fieldClass !== common.FieldClassEnum.Filter &&
            common.isDefined(field.detail) &&
            common.isDefined(field.time_group)
        )
        .forEach(field => {
          let pair = pairs.find(
            p => p.timeGroup === field.time_group && p.detail === field.detail
          );

          if (common.isDefined(pair)) {
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
                common.ErTitleEnum
                  .STORE_FIELD_DUPLICATE_PAIR_OF_DETAIL_AND_TIME_GROUP,
              message: `store field ${common.ParameterEnum.Detail} must be unique for each ${common.ParameterEnum.TimeGroup}`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
