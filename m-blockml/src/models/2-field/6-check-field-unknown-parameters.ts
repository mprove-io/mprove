import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';
import { vmdType } from './_vmd-type';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.CheckFieldUnknownParameters;

export function checkFieldUnknownParameters<T extends vmdType>(item: {
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
      Object.keys(field)
        .filter(
          k =>
            !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()) &&
            [
              enums.ParameterEnum.Name.toString(),
              enums.ParameterEnum.FieldClass.toString()
            ].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === enums.ParameterEnum.Hidden &&
            !field[parameter].match(api.MyRegex.TRUE_FALSE())
          ) {
            // error e115
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_FIELD_HIDDEN,
                message: `parameter "${enums.ParameterEnum.Hidden}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: (<any>field)[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          switch (field.fieldClass) {
            case enums.FieldClassEnum.Dimension: {
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
                // error e109
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_DIMENSION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${enums.FieldClassEnum.Dimension}`,
                    lines: [
                      {
                        line: (<any>field)[parameter + constants.LINE_NUM],
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

            case enums.FieldClassEnum.Time: {
              if (
                [
                  enums.ParameterEnum.Time.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.GroupLabel.toString(),
                  enums.ParameterEnum.GroupDescription.toString(),
                  enums.ParameterEnum.UnnestOn.toString(),
                  enums.ParameterEnum.Source.toString(),
                  enums.ParameterEnum.Sql.toString(),
                  enums.ParameterEnum.Timeframes.toString()
                ].indexOf(parameter) < 0
              ) {
                // error e110
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_TIME_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${enums.FieldClassEnum.Time}`,
                    lines: [
                      {
                        line: (<any>field)[parameter + constants.LINE_NUM],
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
                // error e111
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_MEASURE_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${enums.FieldClassEnum.Measure}`,
                    lines: [
                      {
                        line: (<any>field)[parameter + constants.LINE_NUM],
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
                // error e112
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_CALCULATION_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${enums.FieldClassEnum.Calculation}`,
                    lines: [
                      {
                        line: (<any>field)[parameter + constants.LINE_NUM],
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
                  enums.ParameterEnum.Filter.toString(),
                  enums.ParameterEnum.Hidden.toString(),
                  enums.ParameterEnum.Label.toString(),
                  enums.ParameterEnum.Description.toString(),
                  enums.ParameterEnum.Result.toString(),
                  // 'from_field',
                  enums.ParameterEnum.Default.toString(),
                  enums.ParameterEnum.Sql.toString() // checked before, just for deps logic
                ].indexOf(parameter) < 0
              ) {
                // error e219
                item.errors.push(
                  new BmError({
                    title: enums.ErTitleEnum.UNKNOWN_FILTER_PARAMETER,
                    message: `parameter "${parameter}" can not be used with ${enums.FieldClassEnum.Filter}`,
                    lines: [
                      {
                        line: (<any>field)[parameter + constants.LINE_NUM],
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
            Array.isArray((<any>field)[parameter]) &&
            [
              enums.ParameterEnum.Timeframes.toString(),
              enums.ParameterEnum.Default.toString()
            ].indexOf(parameter) < 0
          ) {
            // error e113
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.UNEXPECTED_LIST_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: (<any>field)[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else if (
            !!(<any>field)[parameter] &&
            (<any>field)[parameter].constructor === Object
          ) {
            // error e114
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_FIELD_PARAMETERS,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: (<any>field)[parameter + constants.LINE_NUM],
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

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
