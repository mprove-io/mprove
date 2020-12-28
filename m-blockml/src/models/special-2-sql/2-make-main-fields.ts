import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { barMeasure } from '../../barrels/bar-measure';

let func = enums.FuncEnum.MakeMainFields;

export function makeMainFields(item: {
  selectWithForceDims: interfaces.VarsSql['selectWithForceDims'];
  depMeasures: interfaces.VarsSql['depMeasures'];
  filters: interfaces.VarsSql['filters'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { selectWithForceDims, filters, depMeasures, model, varsSqlSteps } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    selectWithForceDims,
    filters,
    depMeasures
  });

  let mainUdfs: interfaces.VarsSql['mainUdfs'] = {};
  let mainText: interfaces.VarsSql['mainText'] = [];
  let groupMainBy: interfaces.VarsSql['groupMainBy'] = [];
  let mainFields: interfaces.VarsSql['mainFields'] = [];
  let selected: interfaces.VarsSql['selected'] = {};
  let processedFields: interfaces.VarsSql['processedFields'] = {};

  let i = 0;

  selectWithForceDims.forEach(element => {
    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    mainFields.push({
      asName: asName,
      fieldName: fieldName,
      elementName: `${asName}.${fieldName}`
    });

    selected[element] = 1;
  });

  Object.keys(depMeasures).forEach(asName => {
    Object.keys(depMeasures[asName]).forEach(fieldName => {
      let element = `${asName}.${fieldName}`;

      if (!selected[element]) {
        mainFields.push({
          asName: asName,
          fieldName: fieldName,
          elementName: `${asName}.${fieldName}`
        });
      }

      selected[element] = 1;
    });
  });

  Object.keys(filters).forEach(element => {
    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    if (!selected[element]) {
      mainFields.push({
        asName: asName,
        fieldName: fieldName,
        elementName: `${asName}.${fieldName}`
      });
    }

    let fieldClass: api.FieldClassEnum =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName).fieldClass
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName).fieldClass;

    if (fieldClass === api.FieldClassEnum.Measure) {
      selected[element] = 1;
    }
  });

  mainFields.forEach(mainField => {
    let asName = mainField.asName;
    let fieldName = mainField.fieldName;
    let element = mainField.elementName;

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;
    let sqlSelect;

    if (field.fieldClass === api.FieldClassEnum.Dimension) {
      i++;

      if (asName === constants.MF) {
        // remove ${ } on doubles (no singles exists in _real of model dimensions)
        sqlSelect = api.MyRegex.removeBracketsOnDoubles(field.sqlReal);
      } else {
        sqlSelect = `${asName}.${fieldName}`;
      }

      if (selected[element]) {
        groupMainBy.push(`${i}`); // toString
      }
    } else if (field.fieldClass === api.FieldClassEnum.Measure) {
      i++;

      if (asName === constants.MF) {
        // remove ${ } on doubles (no singles exists in _real of model measures)
        sqlFinal = api.MyRegex.removeBracketsOnDoubles(field.sqlReal);

        if (
          [
            api.FieldTypeEnum.SumByKey,
            api.FieldTypeEnum.AverageByKey,
            api.FieldTypeEnum.MedianByKey,
            api.FieldTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on doubles (no singles exists in _real of model measures)
          sqlKeyFinal = api.MyRegex.removeBracketsOnDoubles(field.sqlKeyReal);
        }
      } else {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlFinal = api.MyRegex.removeBracketsOnSinglesWithAlias(
          field.sqlReal,
          asName
        );

        if (
          [
            api.FieldTypeEnum.SumByKey,
            api.FieldTypeEnum.AverageByKey,
            api.FieldTypeEnum.MedianByKey,
            api.FieldTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on singles (no doubles exists in _real of view measures)
          sqlKeyFinal = api.MyRegex.removeBracketsOnSinglesWithAlias(
            field.sqlKeyReal,
            asName
          );
        }
      }

      switch (true) {
        case field.type === api.FieldTypeEnum.SumByKey: {
          if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
            mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.AverageByKey: {
          if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
            mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.MedianByKey: {
          mainUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.PercentileByKey: {
          mainUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === api.FieldClassEnum.Calculation) {
      if (asName === constants.MF) {
        sqlFinal = api.MyRegex.removeBracketsOnCalculationSinglesMf(
          field.sqlReal
        );
        sqlFinal = api.MyRegex.removeBracketsOnCalculationDoubles(sqlFinal);

        sqlSelect = sqlFinal;
      } else {
        sqlFinal = api.MyRegex.removeBracketsOnCalculationSinglesWithAlias(
          field.sqlReal,
          asName
        );
        // no need to substitute doubles (they not exists in view fields)

        sqlSelect = sqlFinal;
      }
    }

    if (
      selected[element] &&
      field.fieldClass !== api.FieldClassEnum.Calculation
    ) {
      mainText.push(`  ${sqlSelect} as ${asName}_${fieldName},`);
    }

    processedFields[element] = sqlSelect;
  });

  let varsOutput: interfaces.VarsSql = {
    mainUdfs,
    mainText,
    groupMainBy,
    mainFields, // for logs
    selected,
    processedFields
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
