import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeJoinsDoubleDepsAfterSingles(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    x.joins_prepared_deps = {};
    x.joins_double_deps_after_singles = {};

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {

        x.joins_prepared_deps[join.as] = {};
        x.joins_double_deps_after_singles[join.as] = {};

        // work with sql_on_real
        let sqlOnReal = join.sql_on_real;

        let r;
        let reg = ApRegex.CAPTURE_DOUBLE_REF_G();

        while (r = reg.exec(sqlOnReal)) {
          let asName: string = r[1];
          let dep: string = r[2];

          if (!x.joins_double_deps_after_singles[join.as][asName]) {
            x.joins_double_deps_after_singles[join.as][asName] = {};
          }

          x.joins_double_deps_after_singles[join.as][asName][dep] = 1; // 1 from old logic

          if (asName !== x.from_as && asName !== join.as) {
            x.joins_prepared_deps[join.as][asName] = 1;
          }
        }

      });
  });

  return item.models;
}