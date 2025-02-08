import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFractionType } from '~common/interfaces/blockml/internal/file-store-fraction-type';

let func = common.FuncEnum.CheckResultFractionTypes;

export function checkResultFractionTypes(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.results.forEach(result => {
      let fractionTypes: { typeName: string; typeLineNums: number[] }[] = [];

      result.fraction_types.forEach(fractionTypesElement => {
        if (
          common.isDefined(fractionTypesElement) &&
          fractionTypesElement.constructor !== Object
        ) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum.FRACTION_TYPES_ELEMENT_IS_NOT_A_DICTIONARY,
              message: `found at least one ${common.ParameterEnum.FractionTypes} element that is not a dictionary`,
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
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [
                common.ParameterEnum.Type.toString(),
                common.ParameterEnum.Label.toString(),
                common.ParameterEnum.Or.toString(),
                common.ParameterEnum.AndNot.toString(),
                common.ParameterEnum.Meta.toString(),
                common.ParameterEnum.Controls.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.UNKNOWN_FRACTION_TYPES_ELEMENT_PARAMETER,
                  message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.FractionTypes} element`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreFractionType
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
              [common.ParameterEnum.Controls.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNEXPECTED_LIST,
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreFractionType
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
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: fractionTypesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreFractionType
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
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => fractionTypesElement[y as keyof FileStoreFractionType]);

          if (common.isUndefined(fractionTypesElement.type)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_TYPE,
                message: `${common.ParameterEnum.FractionTypes} element must have "${common.ParameterEnum.Type}" parameter`,
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

          if (common.isUndefined(fractionTypesElement.controls)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_CONTROLS,
                message: `${common.ParameterEnum.FractionTypes} element must have "${common.ParameterEnum.Controls}" parameter`,
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

          if (
            common.isDefined(fractionTypesElement.or) &&
            !fractionTypesElement.or.match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.WRONG_OR,
                message: `parameter "${common.ParameterEnum.Or}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: fractionTypesElement.or_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            common.isDefined(fractionTypesElement.and_not) &&
            !fractionTypesElement.and_not.match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.WRONG_AND_NOT,
                message: `parameter "${common.ParameterEnum.AndNot}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: fractionTypesElement.and_not_line_num,
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
          barSpecial.checkStoreFractionControls(
            {
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
                title: common.ErTitleEnum.DUPLICATE_TYPES,
                message: `"${common.ParameterEnum.Type}" value must be unique across ${common.ParameterEnum.FractionTypes} elements`,
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

          let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_RESULT_CHARS_G();
          let r2;

          while ((r2 = reg2.exec(frType.typeName))) {
            typeWrongChars.push(r2[1]);
          }

          let typeWrongCharsString = '';

          if (typeWrongChars.length > 0) {
            typeWrongCharsString = [...new Set(typeWrongChars)].join(', '); // unique

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.WRONG_CHARS_IN_TYPE,
                message: `Characters "${typeWrongCharsString}" can not be used for result (only snake_case "a...z0...9_" is allowed)`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
