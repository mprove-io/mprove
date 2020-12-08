import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { barMeasure } from '../../barrels/bar-measure';

export function makeMainFields(item: interfaces.VarsSql) {
  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: interfaces.VarsSql['mainFields'] = [];

  let selected: { [s: string]: number } = {};
  let processedFields: { [s: string]: string } = {};

  let i = 0;

  item.select.forEach(element => {
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

  Object.keys(item.depMeasures).forEach(asName => {
    Object.keys(item.depMeasures[asName]).forEach(fieldName => {
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

  Object.keys(item.filters).forEach(element => {
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

    let fieldClass: enums.FieldClassEnum =
      asName === constants.MF
        ? item.model.fields.find(mField => mField.name === fieldName).fieldClass
        : item.model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName).fieldClass;

    if (fieldClass === enums.FieldClassEnum.Measure) {
      selected[element] = 1;
    }
  });

  mainFields.forEach(mainField => {
    let asName = mainField.asName;
    let fieldName = mainField.fieldName;
    let element = mainField.elementName;

    let field =
      asName === constants.MF
        ? item.model.fields.find(mField => mField.name === fieldName)
        : item.model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;
    let sqlSelect;

    if (field.fieldClass === enums.FieldClassEnum.Dimension) {
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
    } else if (field.fieldClass === enums.FieldClassEnum.Measure) {
      i++;

      if (asName === constants.MF) {
        // remove ${ } on doubles (no singles exists in _real of model measures)
        sqlFinal = api.MyRegex.removeBracketsOnDoubles(field.sqlReal);

        if (
          [
            enums.FieldAnyTypeEnum.SumByKey,
            enums.FieldAnyTypeEnum.AverageByKey,
            enums.FieldAnyTypeEnum.MedianByKey,
            enums.FieldAnyTypeEnum.PercentileByKey
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
            enums.FieldAnyTypeEnum.SumByKey,
            enums.FieldAnyTypeEnum.AverageByKey,
            enums.FieldAnyTypeEnum.MedianByKey,
            enums.FieldAnyTypeEnum.PercentileByKey
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
        case field.type === enums.FieldAnyTypeEnum.SumByKey: {
          if (item.model.connection.type === api.ConnectionTypeEnum.BigQuery) {
            item.mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureSumByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.AverageByKey: {
          if (item.model.connection.type === api.ConnectionTypeEnum.BigQuery) {
            item.mainUdfs[constants.UDF_MPROVE_ARRAY_SUM] = 1;
          }

          sqlSelect = barMeasure.makeMeasureAverageByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.MedianByKey: {
          item.mainUdfs[
            constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC
          ] = 1;

          sqlSelect = barMeasure.makeMeasureMedianByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.PercentileByKey: {
          item.mainUdfs[
            constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC
          ] = 1;

          sqlSelect = barMeasure.makeMeasurePercentileByKey({
            sqlKeyFinal: sqlKeyFinal,
            sqlFinal: sqlFinal,
            percentile: field.percentile,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.Min: {
          sqlSelect = barMeasure.makeMeasureMin({
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.Max: {
          sqlSelect = barMeasure.makeMeasureMax({
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.CountDistinct: {
          sqlSelect = barMeasure.makeMeasureCountDistinct({
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.List: {
          sqlSelect = barMeasure.makeMeasureList({
            sqlFinal: sqlFinal,
            connection: item.model.connection
          });

          break;
        }

        case field.type === enums.FieldAnyTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.fieldClass === enums.FieldClassEnum.Calculation) {
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
      field.fieldClass !== enums.FieldClassEnum.Calculation
    ) {
      mainText.push(`  ${sqlSelect} as ${asName}_${fieldName},`);
    }

    processedFields[element] = sqlSelect;
  });

  item.mainText = mainText;
  item.groupMainBy = groupMainBy;
  item.mainFields = mainFields;
  item.selected = selected;
  item.processedFields = processedFields;

  return item;
}
