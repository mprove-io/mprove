import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckFieldUnknownParameters;

export function checkFieldUnknownParameters<T extends types.vsmdrType>(
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
                (caller === common.CallerEnum.BuildStoreField &&
                  [
                    common.ParameterEnum.Dimension.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Group.toString(),
                    common.ParameterEnum.TimeGroup.toString(),
                    common.ParameterEnum.Detail.toString(),
                    common.ParameterEnum.Result.toString(),
                    // common.ParameterEnum.SuggestModelDimension.toString(),
                    common.ParameterEnum.FormatNumber.toString(),
                    common.ParameterEnum.CurrencyPrefix.toString(),
                    common.ParameterEnum.CurrencySuffix.toString(),
                    common.ParameterEnum.Required.toString(),
                    common.ParameterEnum.Meta.toString()
                  ].indexOf(parameter) < 0) ||
                ([
                  common.CallerEnum.BuildViewField,
                  common.CallerEnum.BuildModelField,
                  common.CallerEnum.BuildDashboardField,
                  common.CallerEnum.BuildReportField
                ].indexOf(caller) > -1 &&
                  [
                    common.ParameterEnum.Dimension.toString(),
                    common.ParameterEnum.Hidden.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Type.toString(),
                    common.ParameterEnum.Result.toString(),
                    common.ParameterEnum.SuggestModelDimension.toString(),
                    common.ParameterEnum.FormatNumber.toString(),
                    common.ParameterEnum.CurrencyPrefix.toString(),
                    common.ParameterEnum.CurrencySuffix.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_DIMENSION_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${common.FieldClassEnum.Dimension} in ${x.fileExt} file`,
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
                  common.ParameterEnum.Source.toString(),
                  common.ParameterEnum.Timeframes.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_TIME_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${common.FieldClassEnum.Time}`,
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
                (caller === common.CallerEnum.BuildStoreField &&
                  [
                    common.ParameterEnum.Measure.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Result.toString(),
                    common.ParameterEnum.Group.toString(),
                    common.ParameterEnum.FormatNumber.toString(),
                    common.ParameterEnum.CurrencyPrefix.toString(),
                    common.ParameterEnum.CurrencySuffix.toString(),
                    common.ParameterEnum.Required.toString(),
                    common.ParameterEnum.Meta.toString()
                  ].indexOf(parameter) < 0) ||
                ([
                  common.CallerEnum.BuildViewField,
                  common.CallerEnum.BuildModelField,
                  common.CallerEnum.BuildDashboardField,
                  common.CallerEnum.BuildReportField
                ].indexOf(caller) > -1 &&
                  [
                    common.ParameterEnum.Measure.toString(),
                    common.ParameterEnum.Hidden.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Type.toString(),
                    common.ParameterEnum.Result.toString(),
                    common.ParameterEnum.Percentile.toString(),
                    common.ParameterEnum.FormatNumber.toString(),
                    common.ParameterEnum.CurrencyPrefix.toString(),
                    common.ParameterEnum.CurrencySuffix.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_MEASURE_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${common.FieldClassEnum.Measure} in ${x.fileExt} file`,
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
                  // common.ParameterEnum.Calculation.toString(),
                  common.ParameterEnum.Hidden.toString(),
                  common.ParameterEnum.Label.toString(),
                  common.ParameterEnum.Description.toString(),
                  common.ParameterEnum.Result.toString(),
                  common.ParameterEnum.FormatNumber.toString(),
                  common.ParameterEnum.CurrencyPrefix.toString(),
                  common.ParameterEnum.CurrencySuffix.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_CALCULATION_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${common.FieldClassEnum.Calculation}`,
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
                (caller === common.CallerEnum.BuildStoreField &&
                  [
                    common.ParameterEnum.Filter.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.MaxFractions.toString(),
                    common.ParameterEnum.Required.toString(),
                    common.ParameterEnum.FractionControls.toString()
                    // common.ParameterEnum.SuggestModelDimension.toString(),
                  ].indexOf(parameter) < 0) ||
                //
                ([
                  common.CallerEnum.BuildViewField,
                  common.CallerEnum.BuildModelField,
                  common.CallerEnum.BuildStoreField
                ].indexOf(caller) > -1 &&
                  [common.ParameterEnum.Conditions.toString()].indexOf(
                    parameter
                  ) > -1) ||
                //
                ([
                  common.CallerEnum.BuildViewField,
                  common.CallerEnum.BuildModelField
                ].indexOf(caller) > -1 &&
                  [
                    common.ParameterEnum.Filter.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Result.toString(),
                    common.ParameterEnum.SuggestModelDimension.toString(),
                    common.ParameterEnum.Conditions.toString()
                  ].indexOf(parameter) < 0) ||
                //
                ([
                  common.CallerEnum.BuildDashboardField,
                  common.CallerEnum.BuildReportField
                ].indexOf(caller) > -1 &&
                  [
                    common.ParameterEnum.Filter.toString(),
                    common.ParameterEnum.Label.toString(),
                    common.ParameterEnum.Description.toString(),
                    common.ParameterEnum.Result.toString(),
                    common.ParameterEnum.SuggestModelDimension.toString(),
                    common.ParameterEnum.Conditions.toString(),
                    common.ParameterEnum.Fractions.toString(),
                    common.ParameterEnum.StoreModel.toString(),
                    common.ParameterEnum.StoreFilter.toString(),
                    common.ParameterEnum.StoreResult.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.UNKNOWN_FILTER_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${common.FieldClassEnum.Filter} in ${x.fileExt} file`,
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
              common.ParameterEnum.Conditions.toString(),
              common.ParameterEnum.Fractions.toString(),
              common.ParameterEnum.FractionControls.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST,
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
            field[parameter as keyof common.FieldAny]?.constructor === Object &&
            [common.ParameterEnum.Meta.toString()].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
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
              common.ParameterEnum.Timeframes.toString(),
              common.ParameterEnum.Conditions.toString(),
              common.ParameterEnum.Fractions.toString(),
              common.ParameterEnum.FractionControls.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
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

          if (
            errorsOnStart === item.errors.length &&
            parameter === common.ParameterEnum.FractionControls.toString()
          ) {
            barSpecial.checkStoreFractionControls(
              {
                skipOptions: false,
                controls: field.fraction_controls,
                controlsLineNum: field.fraction_controls_line_num,
                fileName: x.fileName,
                filePath: x.filePath,
                structId: item.structId,
                errors: item.errors,
                caller: item.caller
              },
              cs
            );
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
