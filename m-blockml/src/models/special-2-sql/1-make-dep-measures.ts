import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

export function makeDepMeasures(item: interfaces.VarsSql) {
  let depMeasures: { [as: string]: { [dep: string]: number } } = {};

  [...item.select, ...Object.keys(item.filters)].forEach(element => {
    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    // in model fields - only calculations can have fieldsDepsAfterSingles
    // we interested in calculation class now
    if (asName === constants.MF) {
      let field = item.model.fields.find(mField => mField.name === fieldName);

      if (field.fieldClass === api.FieldClassEnum.Calculation) {
        Object.keys(item.model.fieldsDepsAfterSingles[fieldName]).forEach(
          depName => {
            let depModelField = item.model.fields.find(
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

      Object.keys(item.model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
        alias => {
          Object.keys(
            item.model.fieldsDoubleDepsAfterSingles[fieldName][alias]
          ).forEach(depName => {
            let join = item.model.joins.find(j => j.as === alias);

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
      let join = item.model.joins.find(j => j.as === asName);

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
    if (item.model.sqlAlwaysWhereCalcDepsAfterSingles) {
      Object.keys(item.model.sqlAlwaysWhereCalcDepsAfterSingles).forEach(
        depName => {
          let depModelField = item.model.fields.find(
            mField => mField.name === depName
          );

          if (depModelField.fieldClass === api.FieldClassEnum.Measure) {
            if (!depMeasures[constants.MF]) {
              depMeasures[constants.MF] = {};
            }
            depMeasures[constants.MF][depName] = 1;
          }
        }
      );
    }

    // process sqlAlwaysWhereCalcDoubleDepsAfterSingles
    if (item.model.sqlAlwaysWhereCalcDoubleDepsAfterSingles) {
      Object.keys(item.model.sqlAlwaysWhereCalcDoubleDepsAfterSingles).forEach(
        alias => {
          Object.keys(
            item.model.sqlAlwaysWhereCalcDoubleDepsAfterSingles[alias]
          ).forEach(depName => {
            let join = item.model.joins.find(j => j.as === alias);

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

  item.depMeasures = depMeasures;

  return item;
}
