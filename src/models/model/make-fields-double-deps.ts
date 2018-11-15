import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeFieldsDoubleDeps(item: { models: interfaces.Model[] }) {
  item.models.forEach(x => {
    x.fields_double_deps = {};

    x.fields.forEach(f => {
      x.fields_double_deps[f.name] = {};

      // work with sql
      let r;
      let reg = ApRegex.CAPTURE_DOUBLE_REF_G();

      while ((r = reg.exec(f.sql))) {
        let as: string = r[1];
        let dep: string = r[2];

        if (!x.fields_double_deps[f.name][as]) {
          x.fields_double_deps[f.name][as] = {};
        }

        x.fields_double_deps[f.name][as][dep] = f.sql_line_num;
      }

      // work with sql_key
      if (
        f.field_class === enums.FieldClassEnum.Measure &&
        [
          enums.FieldExtTypeEnum.SumByKey,
          enums.FieldExtTypeEnum.AverageByKey,
          enums.FieldExtTypeEnum.MedianByKey,
          enums.FieldExtTypeEnum.PercentileByKey
        ].indexOf(f.type) > -1
      ) {
        let r2;
        let reg2 = ApRegex.CAPTURE_DOUBLE_REF_G();

        while ((r2 = reg2.exec(f.sql_key))) {
          let as: string = r2[1];
          let dep: string = r2[2];

          if (!x.fields_double_deps[f.name][as]) {
            x.fields_double_deps[f.name][as] = {};
          }

          x.fields_double_deps[f.name][as][dep] = f.sql_key_line_num;
        }
      }
    });
  });
  return item.models;
}
