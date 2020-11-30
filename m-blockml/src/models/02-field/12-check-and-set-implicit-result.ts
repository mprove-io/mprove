import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckAndSetImplicitResult;

export function checkAndSetImplicitResult<T extends types.vmdType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (helper.isUndefined(field.result)) {
        switch (field.fieldClass) {
          case enums.FieldClassEnum.Dimension: {
            if (field.type === enums.FieldAnyTypeEnum.YesnoIsTrue) {
              field.result = enums.FieldAnyResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = enums.FieldAnyResultEnum.String;
              field.result_line_num = 0;
            }
            return;
          }

          case enums.FieldClassEnum.Measure: {
            if (field.type === enums.FieldAnyTypeEnum.List) {
              field.result = enums.FieldAnyResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = enums.FieldAnyResultEnum.Number;
              field.result_line_num = 0;
            }
            return;
          }

          case enums.FieldClassEnum.Calculation: {
            field.result = enums.FieldAnyResultEnum.Number;
            field.result_line_num = 0;
            return;
          }

          case enums.FieldClassEnum.Filter: {
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
          case enums.FieldClassEnum.Dimension: {
            if (
              [
                enums.FieldAnyResultEnum.String,
                enums.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_DIMENSION_RESULT,
                  message: `"${field.result}" is not valid result for ${enums.FieldClassEnum.Dimension}`,
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

          case enums.FieldClassEnum.Measure: {
            if (
              [
                enums.FieldAnyResultEnum.String,
                enums.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_MEASURE_RESULT,
                  message: `"${field.result}" is not valid result for ${enums.FieldClassEnum.Measure}`,
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

          case enums.FieldClassEnum.Calculation: {
            if (
              [
                enums.FieldAnyResultEnum.String,
                enums.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_CALCULATION_RESULT,
                  message: `"${field.result}" is not valid result for ${enums.FieldClassEnum.Calculation}`,
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

          case enums.FieldClassEnum.Filter: {
            if (
              [
                enums.FieldAnyResultEnum.String,
                enums.FieldAnyResultEnum.Number,
                enums.FieldAnyResultEnum.DayOfWeek,
                enums.FieldAnyResultEnum.DayOfWeekIndex,
                enums.FieldAnyResultEnum.MonthName,
                enums.FieldAnyResultEnum.QuarterOfYear,
                enums.FieldAnyResultEnum.Ts,
                enums.FieldAnyResultEnum.Yesno
              ].indexOf(field.result) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_FILTER_RESULT,
                  message: `"${field.result}" is not valid result for ${enums.FieldClassEnum.Filter}`,
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

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
