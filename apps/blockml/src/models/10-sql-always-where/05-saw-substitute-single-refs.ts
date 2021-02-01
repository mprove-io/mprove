import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.SawSubstituteSingleRefs;

export function sawSubstituteSingleRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
