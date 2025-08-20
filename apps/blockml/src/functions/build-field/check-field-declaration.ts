import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { FieldAny } from '~common/interfaces/blockml/internal/field-any';
import { MyRegex } from '~common/models/my-regex';
import { sdrType } from '~common/types/sdr-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckFieldDeclaration;

export function checkFieldDeclaration<T extends sdrType>(
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

    x.parameters.forEach(field => {
      let declarations: string[] = Object.keys(field).filter(
        d => [ParameterEnum.Filter.toString()].indexOf(d) > -1
      );

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => field[y as keyof FieldAny] as number)
        .filter(ln => ln !== 0);

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_PARAMETER_DECLARATION,
            message: `parameter must contain ${ParameterEnum.Filter}`,
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
      //       title: ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_PARAMETER,
      //       message: `parameter must contain only one of parameters: ${ParameterEnum.Filter}`,
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
        (field[declaration as keyof FieldAny] as any).match(
          MyRegex.CAPTURE_NOT_ALLOWED_FIELD_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.PARAMETER_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: field[
                  (declaration + LINE_NUM) as keyof FieldAny
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
      let fieldName = field[fieldClass as keyof FieldAny] as string;

      // if (
      //   x.fileExt === FileExtensionEnum.Dashboard &&
      //   fieldClass !== FieldClassEnum.Filter
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: ErTitleEnum.DASHBOARD_FIELD_MUST_BE_A_FILTER,
      //       message: `Found field '${fieldName}' that is ${fieldClass}`,
      //       lines: [
      //         {
      //           line: field[
      //             (declaration + LINE_NUM) as keyof FieldAny
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
        (fieldClass + LINE_NUM) as keyof FieldAny
      ] as number;

      delete field[fieldClass as keyof FieldAny];
      delete field[(fieldClass + LINE_NUM) as keyof FieldAny];

      let newFieldProps: FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <FieldClassEnum>fieldClass
      };
      Object.assign(field, newFieldProps);
    });

    x.fields.forEach(field => {
      let declarations: string[] = Object.keys(field).filter(
        d =>
          [
            ParameterEnum.Dimension.toString(),
            ParameterEnum.Time.toString(),
            ParameterEnum.Measure.toString()
          ].indexOf(d) > -1
      );

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => field[y as keyof FieldAny] as number);

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_FIELD_DECLARATION,
            message: `field must contain one of parameters: ${ParameterEnum.Dimension}, ${ParameterEnum.Time}, ${ParameterEnum.Measure}`,
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
            title: ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_FIELD,
            message: `field must contain only one of parameters: ${ParameterEnum.Dimension}, ${ParameterEnum.Time}, ${ParameterEnum.Measure}`,
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
        (field[declaration as keyof FieldAny] as any).match(
          MyRegex.CAPTURE_NOT_ALLOWED_FIELD_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FIELD_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: field[
                  (declaration + LINE_NUM) as keyof FieldAny
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
      let fieldName = field[fieldClass as keyof FieldAny] as string;

      if (
        [ParameterEnum.Time.toString()].indexOf(fieldClass) > -1 &&
        caller === CallerEnum.BuildStoreField
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_FIELD_DECLARATION,
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
      //   x.fileExt === FileExtensionEnum.Dashboard &&
      //   fieldClass !== FieldClassEnum.Filter
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: ErTitleEnum.DASHBOARD_FIELD_MUST_BE_A_FILTER,
      //       message: `Found field '${fieldName}' that is ${fieldClass}`,
      //       lines: [
      //         {
      //           line: field[
      //             (declaration + LINE_NUM) as keyof FieldAny
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
        (fieldClass + LINE_NUM) as keyof FieldAny
      ] as number;

      delete field[fieldClass as keyof FieldAny];
      delete field[(fieldClass + LINE_NUM) as keyof FieldAny];

      let newFieldProps: FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <FieldClassEnum>fieldClass
      };
      Object.assign(field, newFieldProps);
    });

    x.fields = [...x.parameters, ...x.fields];
    delete x.parameters;

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
