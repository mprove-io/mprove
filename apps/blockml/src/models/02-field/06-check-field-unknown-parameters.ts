import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckFieldUnknownParameters;

export function checkFieldUnknownParameters<T extends types.vmdType>(
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
      Object.keys(field)
        .filter(
          k =>
            !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()) &&
            [
              enums.ParameterEnum.Name.toString(),
              enums.ParameterEnum.FieldClass.toString()
            ].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === enums.ParameterEnum.Hidden &&
            !field[parameter].match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_FIELD_HIDDEN,
                message: `parameter "${enums.ParameterEnum.Hidden}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: field[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.FieldAny
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
                  enums.ParameterEnum.Dimension.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.Label.toString(),
                  enums.ParameterEnum.Description.toString(),
                  enums.ParameterEnum.Unnest.toString(),
                  enums.ParameterEnum.Type.toString(),
                  enums.ParameterEnum.Sql.toString(),
                  enums.ParameterEnum.Result.toString(),
                  enums.ParameterEnum.FormatNumber.toString(),
                  enums.ParameterEnum.CurrencyPrefix.toString(),
                  enums.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_DIMENSION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Dimension}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof interfaces.FieldAny
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
                  enums.ParameterEnum.Time.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.GroupLabel.toString(),
                  enums.ParameterEnum.GroupDescription.toString(),
                  enums.ParameterEnum.Unnest.toString(),
                  enums.ParameterEnum.Source.toString(),
                  enums.ParameterEnum.Sql.toString(),
                  enums.ParameterEnum.Timeframes.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_TIME_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Time}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof interfaces.FieldAny
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
                  enums.ParameterEnum.Measure.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.Label.toString(),
                  enums.ParameterEnum.Description.toString(),
                  enums.ParameterEnum.Type.toString(),
                  enums.ParameterEnum.Result.toString(),
                  enums.ParameterEnum.Sql.toString(),
                  enums.ParameterEnum.SqlKey.toString(),
                  enums.ParameterEnum.Percentile.toString(),
                  enums.ParameterEnum.FormatNumber.toString(),
                  enums.ParameterEnum.CurrencyPrefix.toString(),
                  enums.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_MEASURE_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Measure}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof interfaces.FieldAny
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
                  enums.ParameterEnum.Calculation.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.Label.toString(),
                  enums.ParameterEnum.Description.toString(),
                  enums.ParameterEnum.Sql.toString(),
                  enums.ParameterEnum.Result.toString(),
                  enums.ParameterEnum.FormatNumber.toString(),
                  enums.ParameterEnum.CurrencyPrefix.toString(),
                  enums.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_CALCULATION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Calculation}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof interfaces.FieldAny
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
                  enums.ParameterEnum.Filter.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.Label.toString(),
                  enums.ParameterEnum.Description.toString(),
                  enums.ParameterEnum.Result.toString(),
                  enums.ParameterEnum.Default.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_FILTER_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${common.FieldClassEnum.Filter}`,
                    lines: [
                      {
                        line: field[
                          (parameter +
                            constants.LINE_NUM) as keyof interfaces.FieldAny
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
            Array.isArray(field[parameter as keyof interfaces.FieldAny]) &&
            [
              enums.ParameterEnum.Timeframes.toString(),
              enums.ParameterEnum.Default.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.UNEXPECTED_LIST_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.FieldAny
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
            field[parameter as keyof interfaces.FieldAny]?.constructor ===
            Object
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.FieldAny
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
            !Array.isArray(field[parameter as keyof interfaces.FieldAny]) &&
            [
              enums.ParameterEnum.Default.toString(),
              enums.ParameterEnum.Timeframes.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.FIELD_PARAMETER_IS_NOT_A_LIST,
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: field[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.FieldAny
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
