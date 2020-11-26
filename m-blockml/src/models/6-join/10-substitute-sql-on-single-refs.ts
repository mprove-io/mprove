import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.SubstituteSqlOnSingleRefs;

export function substituteSqlOnSingleRefs(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let sqlOnReal = join.sql_on;

        let reg = api.MyRegex.CAPTURE_SINGLE_REF();
        let r;

        while ((r = reg.exec(sqlOnReal))) {
          let reference = r[1];
          let referenceField = x.fields.find(f => f.name === reference);

          sqlOnReal = api.MyRegex.replaceSingleRefs(
            sqlOnReal,
            reference,
            referenceField.sql
          );
        }

        join.sqlOnReal = sqlOnReal;
      });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
