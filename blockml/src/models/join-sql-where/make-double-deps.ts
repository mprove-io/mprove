import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeDoubleDeps(item: { models: interfaces.Model[] }) {
  item.models.forEach(x => {
    x.joins_double_deps = {};

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        join.sql_where_double_deps = {};

        if (typeof join.sql_where === 'undefined' && join.sql_where === null) {
          return;
        }

        // work with sql_where
        let reg = ApRegex.CAPTURE_DOUBLE_REF_G();
        let r;

        while ((r = reg.exec(join.sql_where))) {
          let as: string = r[1];
          let dep: string = r[2];

          if (!join.sql_where_double_deps[as]) {
            join.sql_where_double_deps[as] = {};
          }

          join.sql_where_double_deps[as][dep] = join.sql_where_line_num;
        }
      });
  });

  return item.models;
}
