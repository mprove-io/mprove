import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkStoreFractionControls } from '#blockml/functions/check-store-fraction-controls/check-store-fraction-controls';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';

let func: Func = 'build-store-start/check-result-fraction-types';

export function checkResultFractionTypes(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
              title: 'FRACTION_TYPES_ELEMENT_IS_NOT_A_DICTIONARY',
              message: `found at least one fraction_types element that is not a dictionary`,
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
                'type'.toString(),
                'label'.toString(),
                'meta'.toString(),
                'controls'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_FRACTION_TYPES_ELEMENT_PARAMETER',
                  message: `parameter "${parameter}" cannot be used in fraction_types element`,
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
              ['controls'.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNEXPECTED_LIST',
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
              ['meta'.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNEXPECTED_DICTIONARY',
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
                title: 'MISSING_TYPE',
                message: `fraction_types element must have "type" parameter`,
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
                title: 'MISSING_CONTROLS',
                message: `fraction_types element must have "controls" parameter`,
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
                title: 'DUPLICATE_TYPES',
                message: `"type" value must be unique across fraction_types elements`,
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
                title: 'WRONG_CHARS_IN_TYPE',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', newStores);

  return newStores;
}
