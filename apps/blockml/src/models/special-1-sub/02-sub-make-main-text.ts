import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barMeasure } from '~blockml/barrels/bar-measure';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubMakeMainText;

export function subMakeMainText(item: {
  select: interfaces.VarsSub['select'];
  depMeasures: interfaces.VarsSub['depMeasures'];
  depDimensions: interfaces.VarsSub['depDimensions'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { select, depMeasures, depDimensions, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<interfaces.VarsSub>({
    select,
    depMeasures,
    depDimensions
  });

  let connection = view.connection;

  let selected: interfaces.VarsSub['selected'] = {};
  let extraUdfs: interfaces.VarsSub['extraUdfs'] = {};
  let processedFields: interfaces.VarsSub['processedFields'] = {};
  let mainText: interfaces.VarsSub['mainText'] = [];
  let groupMainBy: interfaces.VarsSub['groupMainBy'] = [];

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

    if (field.fieldClass === apiToBlockml.FieldClassEnum.Dimension) {
      i++;

      sqlSelect = fieldName;

      groupMainBy.push(`${i}`); // toString
    } else if (field.fieldClass === apiToBlockml.FieldClassEnum.Measure) {
      i++;

      // remove ${ } on singles (no doubles exists in _real of view measures)
      sqlFinal = common.MyRegex.removeBracketsOnSingles(field.sqlReal);

      if (
        [
          apiToBlockml.FieldTypeEnum.SumByKey,
          apiToBlockml.FieldTypeEnum.AverageByKey,
          apiToBlockml.FieldTypeEnum.MedianByKey,
          apiToBlockml.FieldTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlKeyFinal = common.MyRegex.removeBracketsOnSingles(field.sqlKeyReal);
      }

      switch (true) {
        case field.type === apiToBlockml.FieldTypeEnum.SumByKey: {
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

        case field.type === apiToBlockml.FieldTypeEnum.AverageByKey: {
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

        case field.type === apiToBlockml.FieldTypeEnum.MedianByKey: {
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

        case field.type === apiToBlockml.FieldTypeEnum.PercentileByKey: {
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

        case field.type === apiToBlockml.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === apiToBlockml.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === apiToBlockml.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === apiToBlockml.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === apiToBlockml.FieldTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === apiToBlockml.FieldClassEnum.Calculation) {
      sqlFinal = common.MyRegex.removeBracketsOnCalculationSingles(
        field.sqlReal
      );
      // no need to substitute doubles (they not exists in view fields)

      sqlSelect = sqlFinal;
    }

    if (field.fieldClass !== apiToBlockml.FieldClassEnum.Calculation) {
      mainText.push(`  ${sqlSelect} as ${fieldName},`);
    }

    processedFields[fieldName] = sqlSelect;
  });

  let varsOutput: interfaces.VarsSub = {
    mainText,
    groupMainBy,
    selected,
    processedFields,
    extraUdfs
  };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
