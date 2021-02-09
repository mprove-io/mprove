import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
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
      if (common.isUndefined(field.result)) {
        switch (field.fieldClass) {
          case apiToBlockml.FieldClassEnum.Dimension: {
            if (field.type === apiToBlockml.FieldTypeEnum.YesnoIsTrue) {
              field.result = apiToBlockml.FieldResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = apiToBlockml.FieldResultEnum.String;
              field.result_line_num = 0;
            }
            return;
          }

          case apiToBlockml.FieldClassEnum.Measure: {
            if (field.type === apiToBlockml.FieldTypeEnum.List) {
              field.result = apiToBlockml.FieldResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = apiToBlockml.FieldResultEnum.Number;
              field.result_line_num = 0;
            }
            return;
          }

          case apiToBlockml.FieldClassEnum.Calculation: {
            field.result = apiToBlockml.FieldResultEnum.Number;
            field.result_line_num = 0;
            return;
          }

          case apiToBlockml.FieldClassEnum.Filter: {
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
          case apiToBlockml.FieldClassEnum.Dimension: {
            if (
              [
                apiToBlockml.FieldResultEnum.String,
                apiToBlockml.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_DIMENSION_RESULT,
                  message: `"${field.result}" is not valid result for ${apiToBlockml.FieldClassEnum.Dimension}`,
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

          case apiToBlockml.FieldClassEnum.Measure: {
            if (
              [
                apiToBlockml.FieldResultEnum.String,
                apiToBlockml.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_MEASURE_RESULT,
                  message: `"${field.result}" is not valid result for ${apiToBlockml.FieldClassEnum.Measure}`,
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

          case apiToBlockml.FieldClassEnum.Calculation: {
            if (
              [
                apiToBlockml.FieldResultEnum.String,
                apiToBlockml.FieldResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_CALCULATION_RESULT,
                  message: `"${field.result}" is not valid result for ${apiToBlockml.FieldClassEnum.Calculation}`,
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

          case apiToBlockml.FieldClassEnum.Filter: {
            if (
              [
                apiToBlockml.FieldResultEnum.String,
                apiToBlockml.FieldResultEnum.Number,
                apiToBlockml.FieldResultEnum.DayOfWeek,
                apiToBlockml.FieldResultEnum.DayOfWeekIndex,
                apiToBlockml.FieldResultEnum.MonthName,
                apiToBlockml.FieldResultEnum.QuarterOfYear,
                apiToBlockml.FieldResultEnum.Ts,
                apiToBlockml.FieldResultEnum.Yesno
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_FILTER_RESULT,
                  message: `"${field.result}" is not valid result for ${apiToBlockml.FieldClassEnum.Filter}`,
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
