import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.MakeDepMeasures;

export function makeDepMeasures(item: {
  select: interfaces.VarsSql['select'];
  filters: interfaces.VarsSql['filters'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { select, filters, varsSqlSteps, model } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    select,
    filters
  });

  let depMeasures: interfaces.VarsSql['depMeasures'] = {};

  [...select, ...Object.keys(filters)].forEach(element => {
    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    // in model fields - only calculations can have fieldsDepsAfterSingles
    // we interested in calculation class now
    if (asName === constants.MF) {
      let field = model.fields.find(mField => mField.name === fieldName);

      if (field.fieldClass === api.FieldClassEnum.Calculation) {
        Object.keys(model.fieldsDepsAfterSingles[fieldName]).forEach(
          depName => {
            let depModelField = model.fields.find(
              mField => mField.name === depName
            );

            if (depModelField.fieldClass === api.FieldClassEnum.Measure) {
              if (!depMeasures[asName]) {
                depMeasures[asName] = {};
              }
              depMeasures[asName][depName] = 1;
            }
          }
        );
      }

      Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
        alias => {
          Object.keys(
            model.fieldsDoubleDepsAfterSingles[fieldName][alias]
          ).forEach(depName => {
            let join = model.joins.find(j => j.as === alias);

            let depViewField = join.view.fields.find(
              vField => vField.name === depName
            );

            if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
              if (!depMeasures[alias]) {
                depMeasures[alias] = {};
              }
              depMeasures[alias][depName] = 1;
            }
          });
        }
      );

      // in view fields - calculations and measures can have fieldsDepsAfterSingles
      // we interested in calculation class now
    } else {
      let join = model.joins.find(j => j.as === asName);

      let field = join.view.fields.find(vField => vField.name === fieldName);

      if (field.fieldClass === api.FieldClassEnum.Calculation) {
        Object.keys(join.view.fieldsDepsAfterSingles[fieldName]).forEach(
          depName => {
            let depViewField = join.view.fields.find(
              vField => vField.name === depName
            );

            if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
              if (!depMeasures[asName]) {
                depMeasures[asName] = {};
              }
              depMeasures[asName][depName] = 1;
            }
          }
        );
      }
    }

    // process sqlAlwaysWhereCalcDepsAfterSingles
    if (model.sqlAlwaysWhereCalcDepsAfterSingles) {
      Object.keys(model.sqlAlwaysWhereCalcDepsAfterSingles).forEach(depName => {
        let depModelField = model.fields.find(
          mField => mField.name === depName
        );

        if (depModelField.fieldClass === api.FieldClassEnum.Measure) {
          if (!depMeasures[constants.MF]) {
            depMeasures[constants.MF] = {};
          }
          depMeasures[constants.MF][depName] = 1;
        }
      });
    }

    // process sqlAlwaysWhereCalcDoubleDepsAfterSingles
    if (model.sqlAlwaysWhereCalcDoubleDepsAfterSingles) {
      Object.keys(model.sqlAlwaysWhereCalcDoubleDepsAfterSingles).forEach(
        alias => {
          Object.keys(
            model.sqlAlwaysWhereCalcDoubleDepsAfterSingles[alias]
          ).forEach(depName => {
            let join = model.joins.find(j => j.as === alias);

            let depViewField = join.view.fields.find(
              vField => vField.name === depName
            );

            if (depViewField.fieldClass === api.FieldClassEnum.Measure) {
              if (!depMeasures[asName]) {
                depMeasures[asName] = {};
              }
              depMeasures[asName][depName] = 1;
            }
          });
        }
      );
    }
  });

  let varsOutput: interfaces.VarsSql = { depMeasures };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
