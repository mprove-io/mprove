import { barMeasure } from '~blockml/barrels/bar-measure';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.MakeMainText;

export function makeMainText(item: {
  selected: common.VarsSql['selected'];
  unsafeSelect: common.VarsSql['unsafeSelect'];
  filtered: common.VarsSql['filtered'];
  simplifySafeAggregates: boolean;
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
  model: common.FileModel;
}) {
  let {
    selected,
    filtered,
    unsafeSelect,
    simplifySafeAggregates,
    model,
    varsSqlSteps
  } = item;

  let connection = model.connection;

  let varsInput = common.makeCopy<common.VarsSql>({
    selected,
    filtered
  });

  let mainUdfs: common.VarsSql['mainUdfs'] = {};
  let mainText: common.VarsSql['mainText'] = [];
  let groupMainBy: common.VarsSql['groupMainBy'] = [];
  let processedFields: common.VarsSql['processedFields'] = {};

  let i = 0;

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

          sqlSelect =
            simplifySafeAggregates === true &&
            unsafeSelect.indexOf(`${asName}.${fieldName}`) < 0
              ? barMeasure.makeMeasureSum({
                  sqlFinal: sqlFinal,
                  connection: model.connection
                })
              : barMeasure.makeMeasureSumByKey({
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

          sqlSelect =
            simplifySafeAggregates === true &&
            unsafeSelect.indexOf(`${asName}.${fieldName}`) < 0
              ? barMeasure.makeMeasureAverage({
                  sqlFinal: sqlFinal,
                  connection: model.connection
                })
              : barMeasure.makeMeasureAverageByKey({
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
    processedFields
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
