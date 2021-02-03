import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckAndSetImplicitResult;

export function checkAndSetImplicitResult<T extends types.vmdType>(
  item: {
    entities: Array<T>;
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
      if (helper.isUndefined(field.result)) {
        switch (field.fieldClass) {
          case api.FieldClassEnum.Dimension: {
            if (field.type === api.FieldTypeEnum.YesnoIsTrue) {
              field.result = api.FieldResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = api.FieldResultEnum.String;
              field.result_line_num = 0;
            }
            return;
          }

          case api.FieldClassEnum.Measure: {
            if (field.type === api.FieldTypeEnum.List) {
              field.result = api.FieldResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = api.FieldResultEnum.Number;
              field.result_line_num = 0;
            }
            return;
          }

          case api.FieldClassEnum.Calculation: {
            field.result = api.FieldResultEnum.Number;
            field.result_line_num = 0;
            return;
          }

          case api.FieldClassEnum.Filter: {
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
          case api.FieldClassEnum.Dimension: {
            if (
              [api.FieldResultEnum.String, api.FieldResultEnum.Number].indexOf(
                field.result
              ) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_DIMENSION_RESULT,
                  message: `"${field.result}" is not valid result for ${api.FieldClassEnum.Dimension}`,
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

          case api.FieldClassEnum.Measure: {
            if (
              [api.FieldResultEnum.String, api.FieldResultEnum.Number].indexOf(
                field.result
              ) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_MEASURE_RESULT,
                  message: `"${field.result}" is not valid result for ${api.FieldClassEnum.Measure}`,
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

          case api.FieldClassEnum.Calculation: {
            if (
              [api.FieldResultEnum.String, api.FieldResultEnum.Number].indexOf(
                field.result
              ) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_CALCULATION_RESULT,
                  message: `"${field.result}" is not valid result for ${api.FieldClassEnum.Calculation}`,
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

          case api.FieldClassEnum.Filter: {
            if (
              [
                api.FieldResultEnum.String,
                api.FieldResultEnum.Number,
                api.FieldResultEnum.DayOfWeek,
                api.FieldResultEnum.DayOfWeekIndex,
                api.FieldResultEnum.MonthName,
                api.FieldResultEnum.QuarterOfYear,
                api.FieldResultEnum.Ts,
                api.FieldResultEnum.Yesno
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_FILTER_RESULT,
                  message: `"${field.result}" is not valid result for ${api.FieldClassEnum.Filter}`,
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
