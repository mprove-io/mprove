import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckFieldDeclaration;

export function checkFieldDeclaration<T extends types.vmdType>(
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
      let declarations: string[] = Object.keys(field).filter(
        d =>
          [
            enums.ParameterEnum.Dimension.toString(),
            enums.ParameterEnum.Time.toString(),
            enums.ParameterEnum.Measure.toString(),
            enums.ParameterEnum.Calculation.toString(),
            enums.ParameterEnum.Filter.toString()
          ].indexOf(d) > -1
      );

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => field[y as keyof interfaces.FieldAny] as number);

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.MISSING_FIELD_DECLARATION,
            message: `field must contain one of parameters: ${enums.ParameterEnum.Dimension}, ${enums.ParameterEnum.Time}, ${enums.ParameterEnum.Measure}, ${enums.ParameterEnum.Calculation}, ${enums.ParameterEnum.Filter}`,
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

      if (declarations.length > 1) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_FIELD,
            message: `field must contain only one of parameters: ${enums.ParameterEnum.Dimension}, ${enums.ParameterEnum.Time}, ${enums.ParameterEnum.Measure}, ${enums.ParameterEnum.Calculation}, ${enums.ParameterEnum.Filter}`,
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

      let declaration = declarations[0];

      if (
        (field[declaration as keyof interfaces.FieldAny] as any).match(
          common.MyRegex.CAPTURE_NOT_ALLOWED_FIELD_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.FIELD_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: field[
                  (declaration +
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

      let fieldClass = declaration;
      let fieldName = field[fieldClass as keyof interfaces.FieldAny] as string;

      if (
        x.fileExt === common.FileExtensionEnum.Dashboard &&
        fieldClass !== common.FieldClassEnum.Filter
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.DASHBOARD_FIELD_MUST_BE_A_FILTER,
            message: `Found field '${fieldName}' that is ${fieldClass}`,
            lines: [
              {
                line: field[
                  (declaration +
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

      let fieldNameLineNum = field[
        (fieldClass + constants.LINE_NUM) as keyof interfaces.FieldAny
      ] as number;

      delete field[fieldClass as keyof interfaces.FieldAny];
      delete field[
        (fieldClass + constants.LINE_NUM) as keyof interfaces.FieldAny
      ];

      let newFieldProps: interfaces.FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <common.FieldClassEnum>fieldClass
      };
      Object.assign(field, newFieldProps);
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
