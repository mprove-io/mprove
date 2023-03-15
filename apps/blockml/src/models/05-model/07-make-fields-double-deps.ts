import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.MakeFieldsDoubleDeps;

export function makeFieldsDoubleDeps(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.fieldsDoubleDeps = {};

    x.fields.forEach(f => {
      if (f.fieldClass === common.FieldClassEnum.Filter) {
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
        f.fieldClass === common.FieldClassEnum.Measure &&
        [
          common.FieldTypeEnum.SumByKey,
          common.FieldTypeEnum.AverageByKey,
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Models,
    item.models
  );

  return item.models;
}
