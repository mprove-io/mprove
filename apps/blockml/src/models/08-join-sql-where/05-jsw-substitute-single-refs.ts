import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JswSubstituteSingleRefs;

export function jswSubstituteSingleRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let sqlWhereReal = join.sql_where;

        let reg = common.MyRegex.CAPTURE_SINGLE_REF();
        let r;

        while ((r = reg.exec(sqlWhereReal))) {
          let reference = r[1];
          let referenceField = x.fields.find(f => f.name === reference);

          sqlWhereReal = common.MyRegex.replaceSingleRefs(
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
