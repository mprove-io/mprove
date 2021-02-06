import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.MakeDepMeasuresAndDimensions;

export function makeDepMeasuresAndDimensions(item: {
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
  let depDimensions: interfaces.VarsSql['depDimensions'] = {};

  if (helper.isDefined(model.sqlAlwaysWhereCalcDepsAfterSingles)) {
    Object.keys(model.sqlAlwaysWhereCalcDepsAfterSingles).forEach(depName => {
      let depModelField = model.fields.find(mField => mField.name === depName);

      if (depModelField.fieldClass === apiToBlockml.FieldClassEnum.Measure) {
        if (helper.isUndefined(depMeasures[constants.MF])) {
          depMeasures[constants.MF] = {};
        }
        depMeasures[constants.MF][depName] = 1;
      }

      if (depModelField.fieldClass === apiToBlockml.FieldClassEnum.Dimension) {
        if (helper.isUndefined(depDimensions[constants.MF])) {
          depDimensions[constants.MF] = {};
        }
        depDimensions[constants.MF][depName] = 1;
      }
    });
  }

  if (helper.isDefined(model.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions)) {
    Object.keys(model.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions).forEach(
      alias => {
        Object.keys(
          model.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[alias]
        ).forEach(depName => {
          let join = model.joins.find(j => j.as === alias);

          let depViewField = join.view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.fieldClass === apiToBlockml.FieldClassEnum.Measure) {
            if (helper.isUndefined(depMeasures[alias])) {
              depMeasures[alias] = {};
            }
            depMeasures[alias][depName] = 1;
          }

          if (
            depViewField.fieldClass === apiToBlockml.FieldClassEnum.Dimension
          ) {
            if (helper.isUndefined(depDimensions[alias])) {
              depDimensions[alias] = {};
            }
            depDimensions[alias][depName] = 1;
          }
        });
      }
    );
  }

  [...select, ...Object.keys(filters)].forEach(element => {
    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    if (asName === constants.MF) {
      let field = model.fields.find(mField => mField.name === fieldName);

      if (field.fieldClass !== apiToBlockml.FieldClassEnum.Calculation) {
        return;
      }

      Object.keys(model.fieldsDepsAfterSingles[fieldName]).forEach(depName => {
        let depModelField = model.fields.find(
          mField => mField.name === depName
        );

        if (depModelField.fieldClass === apiToBlockml.FieldClassEnum.Measure) {
          if (helper.isUndefined(depMeasures[asName])) {
            depMeasures[asName] = {};
          }
          depMeasures[asName][depName] = 1;
        }

        if (
          depModelField.fieldClass === apiToBlockml.FieldClassEnum.Dimension
        ) {
          if (helper.isUndefined(depDimensions[asName])) {
            depDimensions[asName] = {};
          }
          depDimensions[asName][depName] = 1;
        }
      });

      Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
        alias => {
          Object.keys(
            model.fieldsDoubleDepsAfterSingles[fieldName][alias]
          ).forEach(depName => {
            let join = model.joins.find(j => j.as === alias);

            let depViewField = join.view.fields.find(
              vField => vField.name === depName
            );

            if (
              depViewField.fieldClass === apiToBlockml.FieldClassEnum.Measure
            ) {
              if (helper.isUndefined(depMeasures[alias])) {
                depMeasures[alias] = {};
              }
              depMeasures[alias][depName] = 1;
            }

            if (
              depViewField.fieldClass === apiToBlockml.FieldClassEnum.Dimension
            ) {
              if (helper.isUndefined(depDimensions[alias])) {
                depDimensions[alias] = {};
              }
              depDimensions[alias][depName] = 1;
            }
          });
        }
      );
    } else {
      let join = model.joins.find(j => j.as === asName);
      let field = join.view.fields.find(vField => vField.name === fieldName);

      if (field.fieldClass !== apiToBlockml.FieldClassEnum.Calculation) {
        return;
      }

      Object.keys(join.view.fieldsDepsAfterSingles[fieldName]).forEach(
        depName => {
          let depViewField = join.view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.fieldClass === apiToBlockml.FieldClassEnum.Measure) {
            if (helper.isUndefined(depMeasures[asName])) {
              depMeasures[asName] = {};
            }
            depMeasures[asName][depName] = 1;
          }

          if (
            depViewField.fieldClass === apiToBlockml.FieldClassEnum.Dimension
          ) {
            if (helper.isUndefined(depDimensions[asName])) {
              depDimensions[asName] = {};
            }
            depDimensions[asName][depName] = 1;
          }
        }
      );
    }
  });

  let varsOutput: interfaces.VarsSql = { depMeasures, depDimensions };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
