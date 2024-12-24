import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckFieldUnknownParameters;

export function checkFieldUnknownParameters<T extends types.vmdrType>(
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
      Object.keys(field)
        .filter(
          k =>
            !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()) &&
            [
              common.ParameterEnum.Name.toString(),
              common.ParameterEnum.FieldClass.toString()
            ].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === common.ParameterEnum.Hidden &&
            !field[parameter].match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.WRONG_FIELD_HIDDEN,
                message: `parameter "${common.ParameterEnum.Hidden}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: field[
                      (parameter + constants.LINE_NUM) as keyof common.FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          switch (field.fieldClass) {
            case common.FieldClassEnum.Dimension: {
              if (
                [
                  common.ParameterEnum.Dimension.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.Label.toString(),
                  common.ParameterEnum.Description.toString(),
                  common.ParameterEnum.Unnest.toString(),
                  common.ParameterEnum.Type.toString(),
                  common.ParameterEnum.Sql.toString(),
                  common.ParameterEnum.Result.toString(),
                  common.ParameterEnum.SuggestModelDimension.toString(),
                  common.ParameterEnum.FormatNumber.toString(),
                  common.ParameterEnum.CurrencyPrefix.toString(),
                  common.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_DIMENSION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Dimension}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FieldAny
                        ] as number,
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

            case common.FieldClassEnum.Time: {
              if (
                [
                  common.ParameterEnum.Time.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.GroupLabel.toString(),
                  common.ParameterEnum.GroupDescription.toString(),
                  common.ParameterEnum.Unnest.toString(),
                  common.ParameterEnum.Source.toString(),
                  common.ParameterEnum.Sql.toString(),
                  common.ParameterEnum.Timeframes.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_TIME_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Time}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FieldAny
                        ] as number,
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
                  common.ParameterEnum.Measure.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.Label.toString(),
                  common.ParameterEnum.Description.toString(),
                  common.ParameterEnum.Type.toString(),
                  common.ParameterEnum.Result.toString(),
                  common.ParameterEnum.Sql.toString(),
                  common.ParameterEnum.SqlKey.toString(),
                  common.ParameterEnum.Percentile.toString(),
                  common.ParameterEnum.FormatNumber.toString(),
                  common.ParameterEnum.CurrencyPrefix.toString(),
                  common.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_MEASURE_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Measure}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FieldAny
                        ] as number,
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
                  common.ParameterEnum.Calculation.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.Label.toString(),
                  common.ParameterEnum.Description.toString(),
                  common.ParameterEnum.Sql.toString(),
                  common.ParameterEnum.Result.toString(),
                  common.ParameterEnum.FormatNumber.toString(),
                  common.ParameterEnum.CurrencyPrefix.toString(),
                  common.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_CALCULATION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Calculation}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FieldAny
                        ] as number,
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
                  common.ParameterEnum.Filter.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.Label.toString(),
                  common.ParameterEnum.Description.toString(),
                  common.ParameterEnum.Result.toString(),
                  common.ParameterEnum.SuggestModelDimension.toString(),
                  common.ParameterEnum.Conditions.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_FILTER_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Filter}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof common.FieldAny
                        ] as number,
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
          }

          if (
            Array.isArray(field[parameter as keyof common.FieldAny]) &&
            [
              common.ParameterEnum.Timeframes.toString(),
              common.ParameterEnum.Conditions.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + constants.LINE_NUM) as keyof common.FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            field[parameter as keyof common.FieldAny]?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + constants.LINE_NUM) as keyof common.FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            !Array.isArray(field[parameter as keyof common.FieldAny]) &&
            [
              common.ParameterEnum.Conditions.toString(),
              common.ParameterEnum.Timeframes.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.FIELD_PARAMETER_IS_NOT_A_LIST,
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: field[
                      (parameter + constants.LINE_NUM) as keyof common.FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
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
