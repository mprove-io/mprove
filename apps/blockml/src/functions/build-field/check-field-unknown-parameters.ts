import { ConfigService } from '@nestjs/config';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FieldAny } from '#common/interfaces/blockml/internal/field-any';
import { MyRegex } from '#common/models/my-regex';
import { sdrType } from '#common/types/sdr-type';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkStoreFractionControls } from '../extra/check-store-fraction-controls';
import { log } from '../extra/log';

let func = FuncEnum.CheckFieldUnknownParameters;

export function checkFieldUnknownParameters<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      Object.keys(field)
        .filter(
          k =>
            !k.match(MyRegex.ENDS_WITH_LINE_NUM()) &&
            [
              ParameterEnum.Name.toString(),
              ParameterEnum.FieldClass.toString()
            ].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === ParameterEnum.Hidden &&
            !field[parameter].match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.WRONG_FIELD_HIDDEN,
                message: `parameter "${ParameterEnum.Hidden}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
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
            case FieldClassEnum.Dimension: {
              if (
                (caller === CallerEnum.BuildStoreField &&
                  [
                    ParameterEnum.Dimension.toString(),
                    ParameterEnum.Label.toString(),
                    ParameterEnum.Description.toString(),
                    ParameterEnum.Group.toString(),
                    ParameterEnum.TimeGroup.toString(),
                    ParameterEnum.Detail.toString(),
                    ParameterEnum.Result.toString(),
                    ParameterEnum.FormatNumber.toString(),
                    ParameterEnum.CurrencyPrefix.toString(),
                    ParameterEnum.CurrencySuffix.toString(),
                    ParameterEnum.Required.toString(),
                    ParameterEnum.Meta.toString()
                  ].indexOf(parameter) < 0) ||
                ([
                  CallerEnum.BuildDashboardField,
                  CallerEnum.BuildReportField
                ].indexOf(caller) > -1 &&
                  [
                    ParameterEnum.Dimension.toString(),
                    ParameterEnum.Hidden.toString(),
                    ParameterEnum.Label.toString(),
                    ParameterEnum.Description.toString(),
                    ParameterEnum.Type.toString(),
                    ParameterEnum.Result.toString(),
                    ParameterEnum.SuggestModelDimension.toString(),
                    ParameterEnum.FormatNumber.toString(),
                    ParameterEnum.CurrencyPrefix.toString(),
                    ParameterEnum.CurrencySuffix.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNKNOWN_DIMENSION_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${FieldClassEnum.Dimension} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
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

            case FieldClassEnum.Measure: {
              if (
                caller === CallerEnum.BuildStoreField &&
                [
                  ParameterEnum.Measure.toString(),
                  ParameterEnum.Label.toString(),
                  ParameterEnum.Description.toString(),
                  ParameterEnum.Result.toString(),
                  ParameterEnum.Group.toString(),
                  ParameterEnum.FormatNumber.toString(),
                  ParameterEnum.CurrencyPrefix.toString(),
                  ParameterEnum.CurrencySuffix.toString(),
                  ParameterEnum.Required.toString(),
                  ParameterEnum.Meta.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNKNOWN_MEASURE_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${FieldClassEnum.Measure} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
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

            case FieldClassEnum.Filter: {
              if (
                (caller === CallerEnum.BuildStoreField &&
                  [
                    ParameterEnum.Filter.toString(),
                    ParameterEnum.Label.toString(),
                    ParameterEnum.Description.toString(),
                    ParameterEnum.MaxFractions.toString(),
                    ParameterEnum.Required.toString(),
                    ParameterEnum.FractionControls.toString()
                  ].indexOf(parameter) < 0) ||
                //
                ([CallerEnum.BuildStoreField].indexOf(caller) > -1 &&
                  [ParameterEnum.Conditions.toString()].indexOf(parameter) >
                    -1) ||
                //
                ([
                  CallerEnum.BuildDashboardField,
                  CallerEnum.BuildReportField
                ].indexOf(caller) > -1 &&
                  [
                    ParameterEnum.Filter.toString(),
                    ParameterEnum.Label.toString(),
                    ParameterEnum.Description.toString(),
                    ParameterEnum.Result.toString(),
                    ParameterEnum.SuggestModelDimension.toString(),
                    ParameterEnum.Conditions.toString(),
                    ParameterEnum.Fractions.toString(),
                    ParameterEnum.StoreModel.toString(),
                    ParameterEnum.StoreFilter.toString(),
                    ParameterEnum.StoreResult.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNKNOWN_FILTER_PARAMETER,
                    message: `parameter "${parameter}" cannot be used with ${FieldClassEnum.Filter} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
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
            Array.isArray(field[parameter as keyof FieldAny]) &&
            [
              ParameterEnum.Timeframes.toString(),
              ParameterEnum.Conditions.toString(),
              ParameterEnum.Fractions.toString(),
              ParameterEnum.FractionControls.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
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
            field[parameter as keyof FieldAny]?.constructor === Object &&
            [ParameterEnum.Meta.toString()].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
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
            !Array.isArray(field[parameter as keyof FieldAny]) &&
            [
              ParameterEnum.Timeframes.toString(),
              ParameterEnum.Conditions.toString(),
              ParameterEnum.Fractions.toString(),
              ParameterEnum.FractionControls.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
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
            parameter === ParameterEnum.FractionControls.toString()
          ) {
            checkStoreFractionControls(
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
