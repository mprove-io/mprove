import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckAndSetImplicitResult;

export function checkAndSetImplicitResult<T extends types.vmdType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (common.isUndefined(field.result)) {
        switch (field.fieldClass) {
          case common.FieldClassEnum.Dimension: {
            if (field.type === common.FieldTypeEnum.YesnoIsTrue) {
              field.result = common.FieldResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = common.FieldResultEnum.String;
              field.result_line_num = 0;
            }
            return;
          }

          case common.FieldClassEnum.Measure: {
            if (field.type === common.FieldTypeEnum.List) {
              field.result = common.FieldResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = common.FieldResultEnum.Number;
              field.result_line_num = 0;
            }
            return;
          }

          case common.FieldClassEnum.Calculation: {
            field.result = common.FieldResultEnum.Number;
            field.result_line_num = 0;
            return;
          }

          case common.FieldClassEnum.Filter: {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MISSING_FILTER_RESULT,
                message: `parameter ${enums.ParameterEnum.Result} is required for filters`,
                lines: [
                  {
                    line: field.name_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }
      } else {
        switch (field.fieldClass) {
          case common.FieldClassEnum.Dimension: {
            if (
              [
                common.FieldResultEnum.String,
                common.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_DIMENSION_RESULT,
                  message: `"${field.result}" is not valid result for ${common.FieldClassEnum.Dimension}`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case common.FieldClassEnum.Measure: {
            if (
              [
                common.FieldResultEnum.String,
                common.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_MEASURE_RESULT,
                  message: `"${field.result}" is not valid result for ${common.FieldClassEnum.Measure}`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case common.FieldClassEnum.Calculation: {
            if (
              [
                common.FieldResultEnum.String,
                common.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_CALCULATION_RESULT,
                  message: `"${field.result}" is not valid result for ${common.FieldClassEnum.Calculation}`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case common.FieldClassEnum.Filter: {
            if (
              [
                common.FieldResultEnum.String,
                common.FieldResultEnum.Number,
                common.FieldResultEnum.DayOfWeek,
                common.FieldResultEnum.DayOfWeekIndex,
                common.FieldResultEnum.MonthName,
                common.FieldResultEnum.QuarterOfYear,
                common.FieldResultEnum.Ts,
                common.FieldResultEnum.Yesno
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_FILTER_RESULT,
                  message: `"${field.result}" is not valid result for ${common.FieldClassEnum.Filter}`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
            break;
          }
          // no need to check Time result (result is not set by user)
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
