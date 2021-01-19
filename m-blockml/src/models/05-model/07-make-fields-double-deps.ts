import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.MakeFieldsDoubleDeps;

export function makeFieldsDoubleDeps(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.fieldsDoubleDeps = {};

    x.fields.forEach(f => {
      if (f.fieldClass === api.FieldClassEnum.Filter) {
        return;
      }

      x.fieldsDoubleDeps[f.name] = {};

      // work with sql
      let r;
      let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();

      while ((r = reg.exec(f.sql))) {
        let as: string = r[1];
        let dep: string = r[2];

        if (helper.isUndefined(x.fieldsDoubleDeps[f.name][as])) {
          x.fieldsDoubleDeps[f.name][as] = {};
        }

        x.fieldsDoubleDeps[f.name][as][dep] = f.sql_line_num;
      }

      // work with sqlKey
      if (
        f.fieldClass === api.FieldClassEnum.Measure &&
        [
          api.FieldTypeEnum.SumByKey,
          api.FieldTypeEnum.AverageByKey,
          api.FieldTypeEnum.MedianByKey,
          api.FieldTypeEnum.PercentileByKey
        ].indexOf(f.type) > -1
      ) {
        let r2;
        let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r2 = reg2.exec(f.sql_key))) {
          let as: string = r2[1];
          let dep: string = r2[2];

          if (helper.isUndefined(x.fieldsDoubleDeps[f.name][as])) {
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
