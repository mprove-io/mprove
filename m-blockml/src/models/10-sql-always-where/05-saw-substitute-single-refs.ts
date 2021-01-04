import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.SawSubstituteSingleRefs;

export function sawSubstituteSingleRefs(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    if (helper.isUndefined(x.sql_always_where)) {
      return;
    }

    let sqlAlwaysWhereReal = x.sql_always_where;

    let reg = api.MyRegex.CAPTURE_SINGLE_REF();
    let r;

    while ((r = reg.exec(sqlAlwaysWhereReal))) {
      let reference = r[1];
      let referenceField = x.fields.find(f => f.name === reference);

      sqlAlwaysWhereReal = api.MyRegex.replaceSingleRefs(
        sqlAlwaysWhereReal,
        reference,
        referenceField.sql
      );
    }

    x.sqlAlwaysWhereReal = sqlAlwaysWhereReal;
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
