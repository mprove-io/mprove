import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeJoinsDoubleDeps(item: { models: interfaces.Model[] }) {

  item.models.forEach(x => {

    x.joins_double_deps = {};

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {

        x.joins_double_deps[join.as] = {};

        // work with sql_on
        let r;
        let reg = ApRegex.CAPTURE_DOUBLE_REF_G();

        while (r = reg.exec(join.sql_on)) {
          let as: string = r[1];
          let dep: string = r[2];

          if (!x.joins_double_deps[join.as][as]) {
            x.joins_double_deps[join.as][as] = {};
          }

          x.joins_double_deps[join.as][as][dep] = join.sql_on_line_num;
        }
      });
  });

  return item.models;
}