import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { barMeasure } from '../../barrels/bar-measure';
import { helper } from '../../barrels/helper';

export function makeMainFields(item: interfaces.VarsSub) {
  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: string[] = [];

  let selected: { [s: string]: number } = {};
  let processedFields: { [s: string]: string } = {};

  let i = 0;

  item.select.forEach(fieldName => {
    mainFields.push(fieldName);

    selected[fieldName] = 1;
  });

  Object.keys(item.depMeasures).forEach(fieldName => {
    if (helper.isUndefined(selected[fieldName])) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  Object.keys(item.depDimensions).forEach(fieldName => {
    if (helper.isUndefined(selected[fieldName])) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  mainFields.forEach(fieldName => {
    let field = item.view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;
    let sqlSelect;

    if (field.fieldClass === api.FieldClassEnum.Dimension) {
      i++;

      sqlSelect = fieldName;

      if (selected[fieldName]) {
        groupMainBy.push(`${i}`); // toString
      }
    } else if (field.fieldClass === api.FieldClassEnum.Measure) {
      i++;

      // remove ${ } on singles (no doubles exists in _real of view measures)
      sqlFinal = api.MyRegex.removeBracketsOnSingles(field.sqlReal);

      if (
        [
          api.FieldTypeEnum.SumByKey,
          api.FieldTypeEnum.AverageByKey,
          api.FieldTypeEnum.MedianByKey,
          api.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlKeyFinal = api.MyRegex.removeBracketsOnSingles(field.sqlKeyReal);
      }

      switch (true) {
        case field.type === api.FieldTypeEnum.SumByKey: {
          if (item.connection.type === api.ConnectionTypeEnum.BigQuery) {
            item.extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.AverageByKey: {
          if (item.connection.type === api.ConnectionTypeEnum.BigQuery) {
            item.extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.MedianByKey: {
          item.extraUdfs[
            constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC
          ] = 1;

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.PercentileByKey: {
          item.extraUdfs[
            constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC
          ] = 1;

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: item.connection
          });
          break;
        }

        case field.type === api.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === api.FieldClassEnum.Calculation) {
      sqlFinal = api.MyRegex.removeBracketsOnCalculationSingles(field.sqlReal);
      // no need to substitute doubles (they not exists in view fields)

      sqlSelect = sqlFinal;
    }

    if (
      selected[fieldName] &&
      field.fieldClass !== api.FieldClassEnum.Calculation
    ) {
      mainText.push(`  ${sqlSelect} as ${fieldName},`);
    }

    processedFields[fieldName] = sqlSelect;
  });

  item.mainText = mainText;
  item.groupMainBy = groupMainBy;
  item.mainFields = mainFields;
  item.selected = selected;
  item.processedFields = processedFields;

  return item;
}
