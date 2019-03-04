import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function updateJoinsDoubleDepsAfterSingles(item: {
  models: interfaces.Model[];
}) {
  item.models.forEach(x => {
    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        if (
          typeof join.sql_where_real === 'undefined' &&
          join.sql_where_real === null
        ) {
          return;
        }

        // work with sql_where_real
        let reg = ApRegex.CAPTURE_DOUBLE_REF_G();
        let r;

        while ((r = reg.exec(join.sql_where_real))) {
          let asName: string = r[1];
          let dep: string = r[2];

          if (!x.joins_double_deps_after_singles[join.as][asName]) {
            x.joins_double_deps_after_singles[join.as][asName] = {};
          }

          x.joins_double_deps_after_singles[join.as][asName][dep] = 1; // 1 from old logic

          // don't update joins_prepared_deps
        }
      });
  });

  return item.models;
}
