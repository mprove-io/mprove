import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';
import { api } from '../../barrels/api';

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
          case api.FieldClassEnum.Dimension: {
            if (field.type === api.FieldAnyTypeEnum.YesnoIsTrue) {
              field.result = api.FieldAnyResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = api.FieldAnyResultEnum.String;
              field.result_line_num = 0;
            }
            return;
          }

          case api.FieldClassEnum.Measure: {
            if (field.type === api.FieldAnyTypeEnum.List) {
              field.result = api.FieldAnyResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = api.FieldAnyResultEnum.Number;
              field.result_line_num = 0;
            }
            return;
          }

          case api.FieldClassEnum.Calculation: {
            field.result = api.FieldAnyResultEnum.Number;
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
              [
                api.FieldAnyResultEnum.String,
                api.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
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
              [
                api.FieldAnyResultEnum.String,
                api.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
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
              [
                api.FieldAnyResultEnum.String,
                api.FieldAnyResultEnum.Number
              ].indexOf(field.result) < 0
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
                api.FieldAnyResultEnum.String,
                api.FieldAnyResultEnum.Number,
                api.FieldAnyResultEnum.DayOfWeek,
                api.FieldAnyResultEnum.DayOfWeekIndex,
                api.FieldAnyResultEnum.MonthName,
                api.FieldAnyResultEnum.QuarterOfYear,
                api.FieldAnyResultEnum.Ts,
                api.FieldAnyResultEnum.Yesno
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

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
