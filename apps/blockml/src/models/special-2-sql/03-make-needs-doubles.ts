import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.MakeNeedsDoubles;

export function makeNeedsDoubles(item: {
  selected: common.VarsSql['selected'];
  filters: common.VarsSql['filters'];
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { selected, filters, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
    selected,
    filters
  });

  let needsDoubles: common.VarsSql['needsDoubles'] = {};

  let whereDoubleDeps: { [s: string]: number } = {};
  let whereCalcDoubleDeps: { [s: string]: number } = {};
  let whereCalcDeps: { [s: string]: number } = {};

  // pick double deps from sqlAlwaysWhere
  Object.keys(model.sqlAlwaysWhereDoubleDepsAfterSingles).forEach(as => {
    Object.keys(model.sqlAlwaysWhereDoubleDepsAfterSingles[as]).forEach(dep => {
      let element = `${as}.${dep}`;
      whereDoubleDeps[element] = 1;
    });
  });

  // pick double deps from sqlAlwaysWhereCalc
  Object.keys(model.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions).forEach(
    as => {
      Object.keys(
        model.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[as]
      ).forEach(dep => {
        let element = `${as}.${dep}`;
        whereCalcDoubleDeps[element] = 1;
      });
    }
  );

  // pick deps from sqlAlwaysWhereCalc
  Object.keys(model.sqlAlwaysWhereCalcDepsAfterSingles).forEach(dep => {
    let element = `${constants.MF}.${dep}`;
    whereCalcDeps[element] = 1;
  });

  // unique
  let elements = [
    ...new Set([
      ...Object.keys(selected),
      ...Object.keys(filters).sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      ...Object.keys(whereDoubleDeps),
      ...Object.keys(whereCalcDoubleDeps),
      ...Object.keys(whereCalcDeps)
    ])
  ];

  elements.forEach(element => {
    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let aName = r[1];
    let fName = r[2];

    if (common.isUndefined(needsDoubles[aName])) {
      needsDoubles[aName] = {};
    }
    needsDoubles[aName][fName] = 1;
  });

  if (needsDoubles[constants.MF]) {
    // pick deps for all model fields
    Object.keys(needsDoubles[constants.MF]).forEach(fieldName => {
      Object.keys(model.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
        needsDoubles[constants.MF][dep] = 1;
      });
    });

    // pick double deps for all model fields
    Object.keys(needsDoubles[constants.MF]).forEach(fieldName => {
      Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
        alias => {
          Object.keys(
            model.fieldsDoubleDepsAfterSingles[fieldName][alias]
          ).forEach(dep => {
            if (common.isUndefined(needsDoubles[alias])) {
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
        let join = model.joins.find(j => j.as === asName);

        Object.keys(join.view.fieldsDepsAfterSingles[fieldName]).forEach(
          dep => {
            needsDoubles[asName][dep] = 1;
          }
        );
      });
    });

  let varsOutput: common.VarsSql = { needsDoubles };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
