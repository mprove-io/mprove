import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { barMeasure } from '../../barrels/bar-measure';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { enums } from '../../barrels/enums';

let func = enums.FuncEnum.SubMakeMainFields;

export function subMakeMainFields(item: {
  select: interfaces.VarsSub['select'];
  depMeasures: interfaces.VarsSub['depMeasures'];
  depDimensions: interfaces.VarsSub['depDimensions'];
  view: interfaces.View;
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { select, depMeasures, depDimensions, view, structId, caller } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({
    select,
    depMeasures,
    depDimensions
  });

  let connection = view.connection;

  let extraUdfs: interfaces.VarsSub['extraUdfs'] = {};

  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: string[] = [];

  let selected: { [s: string]: number } = {};
  let processedFields: { [s: string]: string } = {};

  let i = 0;

  select.forEach(fieldName => {
    mainFields.push(fieldName);

    selected[fieldName] = 1;
  });

  Object.keys(depMeasures).forEach(fieldName => {
    if (helper.isUndefined(selected[fieldName])) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  Object.keys(depDimensions).forEach(fieldName => {
    if (helper.isUndefined(selected[fieldName])) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  mainFields.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

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
          if (connection.type === api.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.AverageByKey: {
          if (connection.type === api.ConnectionTypeEnum.BigQuery) {
            extraUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.MedianByKey: {
          extraUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.PercentileByKey: {
          extraUdfs[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = 1;

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: connection
          });
          break;
        }

        case field.type === api.FieldTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: connection
          });

          break;
        }

        case field.type === api.FieldTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: connection
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

  let output: interfaces.VarsSub = {
    mainText,
    groupMainBy,
    mainFields, // only for logs
    selected,
    processedFields,
    extraUdfs
  };

  let varsSubElement: interfaces.VarsSubElement = {
    func: func,
    varsSubInput: varsSubInput,
    varsSubOutput: output
  };
  item.varsSubArray.push(varsSubElement);

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return output;
}
