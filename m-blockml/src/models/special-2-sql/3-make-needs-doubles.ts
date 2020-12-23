import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';

export function makeNeedsDoubles(item: interfaces.VarsSql) {
  let needsDoubles: interfaces.VarsSql['needsDoubles'] = {};

  let whereDoubleDeps: { [s: string]: number } = {};
  let whereCalcDoubleDeps: { [s: string]: number } = {};
  let whereCalcDeps: { [s: string]: number } = {};

  // pick double deps from sqlAlwaysWhere
  Object.keys(item.model.sqlAlwaysWhereDoubleDepsAfterSingles).forEach(as => {
    Object.keys(item.model.sqlAlwaysWhereDoubleDepsAfterSingles[as]).forEach(
      dep => {
        let f = `${as}.${dep}`;
        whereDoubleDeps[f] = 1;
      }
    );
  });

  // pick double deps from sqlAlwaysWhereCalc
  Object.keys(item.model.sqlAlwaysWhereCalcDoubleDepsAfterSingles).forEach(
    as => {
      Object.keys(
        item.model.sqlAlwaysWhereCalcDoubleDepsAfterSingles[as]
      ).forEach(dep => {
        let f = `${as}.${dep}`;
        whereCalcDoubleDeps[f] = 1;
      });
    }
  );

  // pick deps from sqlAlwaysWhereCalc
  Object.keys(item.model.sqlAlwaysWhereCalcDepsAfterSingles).forEach(dep => {
    let f = `${constants.MF}.${dep}`;
    whereCalcDeps[f] = 1;
  });

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
    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let aName = r[1];
    let fName = r[2];

    if (!needsDoubles[aName]) {
      needsDoubles[aName] = {};
    }
    needsDoubles[aName][fName] = 1;
  });

  if (needsDoubles[constants.MF]) {
    // pick deps for all model fields
    Object.keys(needsDoubles[constants.MF]).forEach(fieldName => {
      Object.keys(item.model.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
        needsDoubles[constants.MF][dep] = 1;
      });
    });

    // pick double deps for all model fields
    Object.keys(needsDoubles[constants.MF]).forEach(fieldName => {
      Object.keys(item.model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
        alias => {
          Object.keys(
            item.model.fieldsDoubleDepsAfterSingles[fieldName][alias]
          ).forEach(dep => {
            if (!needsDoubles[alias]) {
              needsDoubles[alias] = {};
            }
            needsDoubles[alias][dep] = 1;
          });
        }
      );
    });
  }

  // pick deps for all view fields
  Object.keys(needsDoubles)
    .filter(a => a !== constants.MF)
    .forEach(asName => {
      Object.keys(needsDoubles[asName]).forEach(fieldName => {
        let join = item.model.joins.find(j => j.as === asName);

        Object.keys(join.view.fieldsDepsAfterSingles[fieldName]).forEach(
          dep => {
            needsDoubles[asName][dep] = 1;
          }
        );
      });
    });

  item.needsDoubles = needsDoubles;

  return item;
}
