import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { FileStoreFractionType } from '#common/interfaces/blockml/internal/file-store-fraction-type';
import { MyRegex } from '#common/models/my-regex';
import { checkStoreFractionControls } from '../extra/check-store-fraction-controls';
import { log } from '../extra/log';

let func = FuncEnum.CheckResultFractionTypes;

export function checkResultFractionTypes(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.results.forEach(result => {
      let fractionTypes: { typeName: string; typeLineNums: number[] }[] = [];

      result.fraction_types.forEach(fractionTypesElement => {
        if (
          isDefined(fractionTypesElement) &&
          fractionTypesElement.constructor !== Object
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.FRACTION_TYPES_ELEMENT_IS_NOT_A_DICTIONARY,
              message: `found at least one ${ParameterEnum.FractionTypes} element that is not a dictionary`,
              lines: [
                {
                  line: result.fraction_types_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        Object.keys(fractionTypesElement)
          .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [
                ParameterEnum.Type.toString(),
                ParameterEnum.Label.toString(),
                ParameterEnum.Meta.toString(),
                ParameterEnum.Controls.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_FRACTION_TYPES_ELEMENT_PARAMETER,
                  message: `parameter "${parameter}" cannot be used in ${ParameterEnum.FractionTypes} element`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter + LINE_NUM) as keyof FileStoreFractionType
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (
              Array.isArray(
                fractionTypesElement[parameter as keyof FileStoreFractionType]
              ) &&
              [ParameterEnum.Controls.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNEXPECTED_LIST,
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter + LINE_NUM) as keyof FileStoreFractionType
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (
              fractionTypesElement[parameter as keyof FileStoreFractionType]
                ?.constructor === Object &&
              [ParameterEnum.Meta.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter + LINE_NUM) as keyof FileStoreFractionType
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          });

        if (errorsOnStart === item.errors.length) {
          let fractionTypeElementKeyLineNums: number[] = Object.keys(
            fractionTypesElement
          )
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => fractionTypesElement[y as keyof FileStoreFractionType]);

          if (isUndefined(fractionTypesElement.type)) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.MISSING_TYPE,
                message: `${ParameterEnum.FractionTypes} element must have "${ParameterEnum.Type}" parameter`,
                lines: [
                  {
                    line: Math.min(...fractionTypeElementKeyLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (isUndefined(fractionTypesElement.controls)) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.MISSING_CONTROLS,
                message: `${ParameterEnum.FractionTypes} element must have "${ParameterEnum.Controls}" parameter`,
                lines: [
                  {
                    line: Math.min(...fractionTypeElementKeyLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }

        if (errorsOnStart === item.errors.length) {
          let index = fractionTypes.findIndex(
            fractionType => fractionType.typeName === fractionTypesElement.type
          );

          if (index > -1) {
            fractionTypes[index].typeLineNums.push(
              fractionTypesElement.type_line_num
            );
          } else {
            fractionTypes.push({
              typeName: fractionTypesElement.type,
              typeLineNums: [fractionTypesElement.type_line_num]
            });
          }
        }

        if (errorsOnStart === item.errors.length) {
          checkStoreFractionControls(
            {
              skipOptions: false,
              controls: fractionTypesElement.controls,
              controlsLineNum: fractionTypesElement.controls_line_num,
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

      if (errorsOnStart === item.errors.length) {
        fractionTypes.forEach(frType => {
          if (frType.typeLineNums.length > 1) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.DUPLICATE_TYPES,
                message: `"${ParameterEnum.Type}" value must be unique across ${ParameterEnum.FractionTypes} elements`,
                lines: frType.typeLineNums.map(l => ({
                  line: l,
                  name: x.fileName,
                  path: x.filePath
                }))
              })
            );
            return;
          }

          //

          let typeWrongChars: string[] = [];

          let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_RESULT_CHARS_G();
          let r2;

          while ((r2 = reg2.exec(frType.typeName))) {
            typeWrongChars.push(r2[1]);
          }

          let typeWrongCharsString = '';

          if (typeWrongChars.length > 0) {
            typeWrongCharsString = [...new Set(typeWrongChars)].join(', '); // unique

            item.errors.push(
              new BmError({
                title: ErTitleEnum.WRONG_CHARS_IN_TYPE,
                message: `Characters "${typeWrongCharsString}" cannot be used for result (only snake_case "a...z0...9_" is allowed)`,
                lines: [
                  {
                    line: frType.typeLineNums[0],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return false;
          }
        });
      }
    });

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
