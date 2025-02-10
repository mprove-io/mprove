import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckAndSetImplicitResult;

export function checkAndSetImplicitResult<T extends types.vsmdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (
        [
          common.CallerEnum.BuildViewField,
          common.CallerEnum.BuildModelField,
          common.CallerEnum.BuildReportField,
          common.CallerEnum.BuildDashboardField
        ].indexOf(caller) > -1
      ) {
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
                  title: common.ErTitleEnum.MISSING_FILTER_RESULT,
                  message: `parameter ${common.ParameterEnum.Result} is required for filters`,
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
              if (common.DIMENSION_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_DIMENSION_RESULT,
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
              if (common.MEASURE_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_MEASURE_RESULT,
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
              if (common.CALCULATION_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_CALCULATION_RESULT,
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
              if (common.FILTER_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_FILTER_RESULT,
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
      }

      if (caller === common.CallerEnum.BuildStoreField) {
        if (
          common.isUndefined(field.result) &&
          field.fieldClass !== common.FieldClassEnum.Filter
        ) {
          let fieldKeysLineNums: number[] = Object.keys(field)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => field[y as keyof common.FieldAny] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_STORE_FIELD_RESULT,
              message: `field "${field.result}" is requred`,
              lines: [
                {
                  line: Math.min(...fieldKeysLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let results = (x as common.FileStore).results.map(r => r.result);

        if (
          common.isDefined(field.result) &&
          field.fieldClass !== common.FieldClassEnum.Filter &&
          results.indexOf(field.result) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_STORE_FIELD_RESULT,
              message: `field ${field.result} must be one of store results`,
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
      }
    });

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
