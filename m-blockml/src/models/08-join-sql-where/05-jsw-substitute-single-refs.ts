import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.JswSubstituteSingleRefs;

export function jswSubstituteSingleRefs(
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
    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let sqlWhereReal = join.sql_where;

        let reg = api.MyRegex.CAPTURE_SINGLE_REF();
        let r;

        while ((r = reg.exec(sqlWhereReal))) {
          let reference = r[1];
          let referenceField = x.fields.find(f => f.name === reference);

          sqlWhereReal = api.MyRegex.replaceSingleRefs(
            sqlWhereReal,
            reference,
            referenceField.sql
          );
        }

        join.sqlWhereReal = sqlWhereReal;
      });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
