import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckFieldDeclaration;

export function checkFieldDeclaration<T extends types.sdrType>(
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

    x.parameters.forEach(field => {
      let declarations: string[] = Object.keys(field).filter(
        d => [common.ParameterEnum.Filter.toString()].indexOf(d) > -1
      );

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => field[y as keyof common.FieldAny] as number)
        .filter(ln => ln !== 0);

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_PARAMETER_DECLARATION,
            message: `parameter must contain ${common.ParameterEnum.Filter}`,
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

      // if (declarations.length > 1) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_PARAMETER,
      //       message: `parameter must contain only one of parameters: ${common.ParameterEnum.Filter}`,
      //       lines: [
      //         {
      //           line: Math.min(...fieldKeysLineNums),
      //           name: x.fileName,
      //           path: x.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }

      let declaration = declarations[0];

      if (
        (field[declaration as keyof common.FieldAny] as any).match(
          common.MyRegex.CAPTURE_NOT_ALLOWED_FIELD_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.PARAMETER_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: field[
                  (declaration + constants.LINE_NUM) as keyof common.FieldAny
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
      let fieldName = field[fieldClass as keyof common.FieldAny] as string;

      // if (
      //   x.fileExt === common.FileExtensionEnum.Dashboard &&
      //   fieldClass !== common.FieldClassEnum.Filter
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.DASHBOARD_FIELD_MUST_BE_A_FILTER,
      //       message: `Found field '${fieldName}' that is ${fieldClass}`,
      //       lines: [
      //         {
      //           line: field[
      //             (declaration + constants.LINE_NUM) as keyof common.FieldAny
      //           ] as number,
      //           name: x.fileName,
      //           path: x.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }

      let fieldNameLineNum = field[
        (fieldClass + constants.LINE_NUM) as keyof common.FieldAny
      ] as number;

      delete field[fieldClass as keyof common.FieldAny];
      delete field[(fieldClass + constants.LINE_NUM) as keyof common.FieldAny];

      let newFieldProps: common.FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <common.FieldClassEnum>fieldClass
      };
      Object.assign(field, newFieldProps);
    });

    x.fields.forEach(field => {
      let declarations: string[] = Object.keys(field).filter(
        d =>
          [
            common.ParameterEnum.Dimension.toString(),
            common.ParameterEnum.Time.toString(),
            common.ParameterEnum.Measure.toString()
          ].indexOf(d) > -1
      );

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => field[y as keyof common.FieldAny] as number);

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_FIELD_DECLARATION,
            message: `field must contain one of parameters: ${common.ParameterEnum.Dimension}, ${common.ParameterEnum.Time}, ${common.ParameterEnum.Measure}`,
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
            title: common.ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_FIELD,
            message: `field must contain only one of parameters: ${common.ParameterEnum.Dimension}, ${common.ParameterEnum.Time}, ${common.ParameterEnum.Measure}`,
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
        (field[declaration as keyof common.FieldAny] as any).match(
          common.MyRegex.CAPTURE_NOT_ALLOWED_FIELD_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.FIELD_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: field[
                  (declaration + constants.LINE_NUM) as keyof common.FieldAny
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
      let fieldName = field[fieldClass as keyof common.FieldAny] as string;

      if (
        [common.ParameterEnum.Time.toString()].indexOf(fieldClass) > -1 &&
        caller === common.CallerEnum.BuildStoreField
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_FIELD_DECLARATION,
            message: `${fieldClass} cannot be used in fields of ${x.fileExt} file`,
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

      // if (
      //   x.fileExt === common.FileExtensionEnum.Dashboard &&
      //   fieldClass !== common.FieldClassEnum.Filter
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.DASHBOARD_FIELD_MUST_BE_A_FILTER,
      //       message: `Found field '${fieldName}' that is ${fieldClass}`,
      //       lines: [
      //         {
      //           line: field[
      //             (declaration + constants.LINE_NUM) as keyof common.FieldAny
      //           ] as number,
      //           name: x.fileName,
      //           path: x.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }

      let fieldNameLineNum = field[
        (fieldClass + constants.LINE_NUM) as keyof common.FieldAny
      ] as number;

      delete field[fieldClass as keyof common.FieldAny];
      delete field[(fieldClass + constants.LINE_NUM) as keyof common.FieldAny];

      let newFieldProps: common.FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <common.FieldClassEnum>fieldClass
      };
      Object.assign(field, newFieldProps);
    });

    x.fields = [...x.parameters, ...x.fields];
    delete x.parameters;

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
