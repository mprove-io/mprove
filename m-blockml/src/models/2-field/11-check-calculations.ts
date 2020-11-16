import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { vmType } from './_vm-type';

let func = enums.FuncEnum.CheckCalculations;

export function checkCalculations<T extends vmType>(item: {
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
      if (field.fieldClass !== enums.FieldClassEnum.Calculation) {
        return;
      }
      if (field.sql && !field.sql.match(api.MyRegex.CONTAINS_BLOCKML_REF())) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.CALCULATION_SQL_MISSING_BLOCKML_REFERENCE,
            message: `${enums.FieldClassEnum.Calculation} ${enums.ParameterEnum.Sql} must have a BlockML reference`,
            lines: [
              {
                line: field.sql_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
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
