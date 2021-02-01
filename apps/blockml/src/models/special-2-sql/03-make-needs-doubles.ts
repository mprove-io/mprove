import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.MakeNeedsDoubles;

export function makeNeedsDoubles(item: {
  selected: interfaces.VarsSql['selected'];
  filters: interfaces.VarsSql['filters'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { selected, filters, varsSqlSteps, model } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    selected,
    filters
  });

  let needsDoubles: interfaces.VarsSql['needsDoubles'] = {};

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
      ...Object.keys(filters),
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

    if (helper.isUndefined(needsDoubles[aName])) {
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
            if (helper.isUndefined(needsDoubles[alias])) {
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

  let varsOutput: interfaces.VarsSql = { needsDoubles };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
