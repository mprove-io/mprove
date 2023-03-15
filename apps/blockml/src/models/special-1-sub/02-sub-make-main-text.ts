import { barMeasure } from '~blockml/barrels/bar-measure';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.SubMakeMainText;

export function subMakeMainText(item: {
  select: common.VarsSub['select'];
  depMeasures: common.VarsSub['depMeasures'];
  depDimensions: common.VarsSub['depDimensions'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
}) {
  let { select, depMeasures, depDimensions, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<common.VarsSub>({
    select,
    depMeasures,
    depDimensions
  });

  let connection = view.connection;

  let selected: common.VarsSub['selected'] = {};
  let extraUdfs: common.VarsSub['extraUdfs'] = {};
  let processedFields: common.VarsSub['processedFields'] = {};
  let mainText: common.VarsSub['mainText'] = [];
  let groupMainBy: common.VarsSub['groupMainBy'] = [];

  [
    ...select,
    ...Object.keys(depMeasures),
    ...Object.keys(depDimensions)
  ].forEach(fieldName => {
    selected[fieldName] = 1;
  });

  let i = 0;

  Object.keys(selected).forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;

    let sqlSelect;

    if (field.fieldClass === common.FieldClassEnum.Dimension) {
      i++;

      sqlSelect = fieldName;

      if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
        groupMainBy.push(fieldName);
      } else {
        groupMainBy.push(`${i}`); // toString
      }
    } else if (field.fieldClass === common.FieldClassEnum.Measure) {
      i++;

      // remove ${ } on singles (no doubles exists in _real of view measures)
      sqlFinal = common.MyRegex.removeBracketsOnSingles(field.sqlReal);

      if (
        [
          common.FieldTypeEnum.SumByKey,
          common.FieldTypeEnum.AverageByKey,
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlKeyFinal = common.MyRegex.removeBracketsOnSingles(field.sqlKeyReal);
      }

      switch (true) {
        case field.type === common.FieldTypeEnum.Sum: {
          sqlSelect = barMeasure.makeMeasureSum({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.SumByKey: {
          if (connection.type === common.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Average: {
          sqlSelect = barMeasure.makeMeasureAverage({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.AverageByKey: {
          if (connection.type === common.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.MedianByKey: {
          if (connection.type === common.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;
          }

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.PercentileByKey: {
          if (connection.type === common.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;
          }

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: connection
          });
          break;
        }

        case field.type === common.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === common.FieldTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
      sqlFinal = common.MyRegex.removeBracketsOnCalculationSingles(
        field.sqlReal
      );
      // no need to substitute doubles (they not exists in view fields)

      sqlSelect = sqlFinal;
    }

    if (field.fieldClass !== common.FieldClassEnum.Calculation) {
      mainText.push(`  ${sqlSelect} as ${fieldName},`);
    }

    processedFields[fieldName] = sqlSelect;
  });

  let varsOutput: common.VarsSub = {
    mainText,
    groupMainBy,
    selected,
    processedFields,
    extraUdfs
  };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
