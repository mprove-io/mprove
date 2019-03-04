import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeDoubleDeps(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    x.sql_always_where_calc_double_deps = {};

    if (typeof x.sql_always_where_calc === 'undefined' || x.sql_always_where_calc === null) {
      return;
    }

    let reg = ApRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while (r = reg.exec(x.sql_always_where_calc)) {
      let as: string = r[1];
      let dep: string = r[2];

      if (!x.sql_always_where_calc_double_deps[as]) {
        x.sql_always_where_calc_double_deps[as] = {};
      }

      x.sql_always_where_calc_double_deps[as][dep] = x.sql_always_where_calc_line_num;
    }
  });

  return item.models;
}
