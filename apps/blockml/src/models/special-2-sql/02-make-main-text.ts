import { barMeasure } from '~blockml/barrels/bar-measure';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.MakeMainText;

export function makeMainText(item: {
  select: common.VarsSql['select'];
  depMeasures: common.VarsSql['depMeasures'];
  depDimensions: common.VarsSql['depDimensions'];
  filters: common.VarsSql['filters'];
  varsSqlSteps: common.FileReport['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { select, filters, depMeasures, depDimensions, model, varsSqlSteps } =
    item;

  let connection = model.connection;

  let varsInput = common.makeCopy<common.VarsSql>({
    select,
    filters,
    depMeasures,
    depDimensions
  });

  let mainUdfs: common.VarsSql['mainUdfs'] = {};
  let mainText: common.VarsSql['mainText'] = [];
  let groupMainBy: common.VarsSql['groupMainBy'] = [];
  let selected: common.VarsSql['selected'] = {};
  let filtered: common.VarsSql['filtered'] = {};
  let processedFields: common.VarsSql['processedFields'] = {};

  let i = 0;

  select.forEach(element => {
    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    selected[element] = { asName: asName, fieldName: fieldName };
  });

  Object.keys(depMeasures).forEach(asName => {
    Object.keys(depMeasures[asName]).forEach(fieldName => {
      let element = `${asName}.${fieldName}`;
      selected[element] = { asName: asName, fieldName: fieldName };
    });
  });

  Object.keys(depDimensions).forEach(asName => {
    Object.keys(depDimensions[asName]).forEach(fieldName => {
      let element = `${asName}.${fieldName}`;
      selected[element] = { asName: asName, fieldName: fieldName };
    });
  });

  Object.keys(filters)
    .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
    .forEach(element => {
      let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
      let r = reg.exec(element);

      let asName = r[1];
      let fieldName = r[2];

      let fieldClass: common.FieldClassEnum =
        asName === constants.MF
          ? model.fields.find(mField => mField.name === fieldName).fieldClass
          : model.joins
              .find(j => j.as === asName)
              .view.fields.find(vField => vField.name === fieldName).fieldClass;

      filtered[element] = { asName: asName, fieldName: fieldName };

      if (fieldClass === common.FieldClassEnum.Measure) {
        selected[element] = { asName: asName, fieldName: fieldName };
      }
    });

  let els = Object.assign({}, selected, filtered);

  Object.keys(els).forEach(element => {
    let { asName, fieldName } = els[element];

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;

    let sqlSelect;

    if (field.fieldClass === common.FieldClassEnum.Dimension) {
      i++;

      if (asName === constants.MF) {
        // remove ${ } on doubles (no singles exists in _real of model dimensions)
        sqlSelect = common.MyRegex.removeBracketsOnDoubles(field.sqlReal);
      } else {
        sqlSelect = `${asName}.${fieldName}`;
      }

      if (selected[element]) {
        if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
          groupMainBy.push(`${asName}_${fieldName}`);
        } else {
          groupMainBy.push(`${i}`); // toString
        }
      }
    } else if (field.fieldClass === common.FieldClassEnum.Measure) {
      i++;

      if (asName === constants.MF) {
        // remove ${ } on doubles (no singles exists in _real of model measures)
        sqlFinal = common.MyRegex.removeBracketsOnDoubles(field.sqlReal);

        if (
          [
            common.FieldTypeEnum.SumByKey,
            common.FieldTypeEnum.AverageByKey,
            common.FieldTypeEnum.MedianByKey,
            common.FieldTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on doubles (no singles exists in _real of model measures)
          sqlKeyFinal = common.MyRegex.removeBracketsOnDoubles(
            field.sqlKeyReal
          );
        }
      } else {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlFinal = common.MyRegex.removeBracketsOnSinglesWithAlias(
          field.sqlReal,
          asName
        );

        if (
          [
            common.FieldTypeEnum.SumByKey,
            common.FieldTypeEnum.AverageByKey,
            common.FieldTypeEnum.MedianByKey,
            common.FieldTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on singles (no doubles exists in _real of view measures)
          sqlKeyFinal = common.MyRegex.removeBracketsOnSinglesWithAlias(
            field.sqlKeyReal,
            asName
          );
        }
      }

      switch (true) {
        case field.type === common.FieldTypeEnum.Sum: {
          sqlSelect = barMeasure.makeMeasureSum({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.SumByKey: {
          if (model.connection.type === common.ConnectionTypeEnum.BigQuery) {
            mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Average: {
          sqlSelect = barMeasure.makeMeasureAverage({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.AverageByKey: {
          if (model.connection.type === common.ConnectionTypeEnum.BigQuery) {
            mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.MedianByKey: {
          mainUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.PercentileByKey: {
          mainUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: model.connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
      if (asName === constants.MF) {
        sqlFinal = common.MyRegex.removeBracketsOnCalculationSinglesMf(
          field.sqlReal
        );
        sqlFinal = common.MyRegex.removeBracketsOnCalculationDoubles(sqlFinal);

        sqlSelect = sqlFinal;
      } else {
        sqlFinal = common.MyRegex.removeBracketsOnCalculationSinglesWithAlias(
          field.sqlReal,
          asName
        );
        // no need to substitute doubles (they not exists in view fields)

        sqlSelect = sqlFinal;
      }
    }

    if (
      common.isDefined(selected[element]) &&
      field.fieldClass !== common.FieldClassEnum.Calculation
    ) {
      let sel = `  ${sqlSelect} as ${asName}_${fieldName},`;
      mainText = mainText.concat(sel.split('\n'));
    }

    processedFields[element] = sqlSelect;
  });

  let varsOutput: common.VarsSql = {
    mainUdfs,
    mainText,
    groupMainBy,
    selected,
    processedFields
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
