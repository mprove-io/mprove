import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeNeedsDoubles(item: interfaces.Vars) {
  let needsDoubles: {
    [a: string]: {
      [f: string]: number;
    };
  } = {};

  let whereDoubleDeps: { [s: string]: number } = {};
  let whereCalcDoubleDeps: { [s: string]: number } = {};
  let whereCalcDeps: { [s: string]: number } = {};

  // pick double deps from sql_always_where
  Object.keys(item.model.sql_always_where_double_deps_after_singles).forEach(
    as => {
      Object.keys(
        item.model.sql_always_where_double_deps_after_singles[as]
      ).forEach(dep => {
        let f = `${as}.${dep}`;
        whereDoubleDeps[f] = 1;
      });
    }
  );

  // pick double deps from sql_always_where_calc
  Object.keys(
    item.model.sql_always_where_calc_double_deps_after_substitutions
  ).forEach(as => {
    Object.keys(
      item.model.sql_always_where_calc_double_deps_after_substitutions[as]
    ).forEach(dep => {
      let f = `${as}.${dep}`;
      whereCalcDoubleDeps[f] = 1;
    });
  });

  // pick deps from sql_always_where_calc
  Object.keys(item.model.sql_always_where_calc_deps_after_singles).forEach(
    dep => {
      let f = `mf.${dep}`;
      whereCalcDeps[f] = 1;
    }
  );

  // unique
  let elements = [
    ...new Set([
      ...Object.keys(item.selected),
      ...Object.keys(item.filters),
      ...Object.keys(whereDoubleDeps),
      ...Object.keys(whereCalcDoubleDeps),
      ...Object.keys(whereCalcDeps)
    ])
  ];

  elements.forEach(element => {
    let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let aName = r[1];
    let fName = r[2];

    if (!needsDoubles[aName]) {
      needsDoubles[aName] = {};
    }
    needsDoubles[aName][fName] = 1;
  });

  if (needsDoubles['mf']) {
    // pick deps for all model fields
    Object.keys(needsDoubles['mf']).forEach(fieldName => {
      Object.keys(item.model.fields_deps_after_singles[fieldName]).forEach(
        dep => {
          needsDoubles['mf'][dep] = 1;
        }
      );
    });

    // pick double deps for all model fields
    Object.keys(needsDoubles['mf']).forEach(fieldName => {
      Object.keys(
        item.model.fields_double_deps_after_singles[fieldName]
      ).forEach(alias => {
        Object.keys(
          item.model.fields_double_deps_after_singles[fieldName][alias]
        ).forEach(dep => {
          if (!needsDoubles[alias]) {
            needsDoubles[alias] = {};
          }
          needsDoubles[alias][dep] = 1;
        });
      });
    });
  }

  // pick deps for all view fields
  Object.keys(needsDoubles)
    .filter(a => a !== 'mf')
    .forEach(asName => {
      Object.keys(needsDoubles[asName]).forEach(fieldName => {
        let join = item.model.joins.find(j => j.as === asName);

        Object.keys(join.view.fields_deps_after_singles[fieldName]).forEach(
          dep => {
            needsDoubles[asName][dep] = 1;
          }
        );
      });
    });

  item.needs_doubles = needsDoubles;

  return item;
}
