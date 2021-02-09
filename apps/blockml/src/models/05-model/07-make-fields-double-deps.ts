import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.MakeFieldsDoubleDeps;

export function makeFieldsDoubleDeps(
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
    x.fieldsDoubleDeps = {};

    x.fields.forEach(f => {
      if (f.fieldClass === apiToBlockml.FieldClassEnum.Filter) {
        return;
      }

      x.fieldsDoubleDeps[f.name] = {};

      // work with sql
      let r;
      let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G();

      while ((r = reg.exec(f.sql))) {
        let as: string = r[1];
        let dep: string = r[2];

        if (common.isUndefined(x.fieldsDoubleDeps[f.name][as])) {
          x.fieldsDoubleDeps[f.name][as] = {};
        }

        x.fieldsDoubleDeps[f.name][as][dep] = f.sql_line_num;
      }

      // work with sqlKey
      if (
        f.fieldClass === apiToBlockml.FieldClassEnum.Measure &&
        [
          apiToBlockml.FieldTypeEnum.SumByKey,
          apiToBlockml.FieldTypeEnum.AverageByKey,
          apiToBlockml.FieldTypeEnum.MedianByKey,
          apiToBlockml.FieldTypeEnum.PercentileByKey
        ].indexOf(f.type) > -1
      ) {
        let r2;
        let reg2 = common.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r2 = reg2.exec(f.sql_key))) {
          let as: string = r2[1];
          let dep: string = r2[2];

          if (common.isUndefined(x.fieldsDoubleDeps[f.name][as])) {
            x.fieldsDoubleDeps[f.name][as] = {};
          }

          x.fieldsDoubleDeps[f.name][as][dep] = f.sql_key_line_num;
        }
      }
    });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
