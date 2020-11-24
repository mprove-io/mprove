import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { constants } from '../../barrels/constants';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckFieldDeclaration;

export function checkFieldDeclaration<T extends types.vmdType>(item: {
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
        .filter(y => y.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => (<any>field)[y]);

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
      } else if (declarations.length > 1) {
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
        (<any>field)[declaration].match(api.MyRegex.CAPTURE_SPECIAL_CHARS_G())
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.FIELD_DECLARATION_WRONG_VALUE,
            message: `parameter "${declaration}" contains wrong characters or whitespace`,
            lines: [
              {
                line: (<any>field)[declaration + constants.LINE_NUM],
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let fieldClass = declarations[0];

      let fieldName = (<any>field)[fieldClass];
      let fieldNameLineNum = (<any>field)[fieldClass + constants.LINE_NUM];

      delete (<any>field)[fieldClass];
      delete (<any>field)[fieldClass + constants.LINE_NUM];

      let newFieldProps: interfaces.FieldAny = {
        name: fieldName,
        name_line_num: fieldNameLineNum,
        fieldClass: <any>fieldClass
      };
      Object.assign(field, newFieldProps);
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
