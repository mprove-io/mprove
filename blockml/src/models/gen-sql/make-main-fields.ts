import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { gen } from '../../barrels/gen';
import { api } from '../../barrels/api';

export function makeMainFields(item: interfaces.Vars) {
  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: {
    as_name: string;
    field_name: string;
    element_name: string;
  }[] = [];

  let selected: { [s: string]: number } = {};
  let processedFields: { [s: string]: string } = {};

  let i: number = 0;

  item.select.forEach(element => {
    let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    mainFields.push({
      as_name: asName,
      field_name: fieldName,
      element_name: asName + '.' + fieldName
    });

    selected[element] = 1;
  });

  Object.keys(item.dep_measures).forEach(asName => {
    Object.keys(item.dep_measures[asName]).forEach(fieldName => {
      let element = asName + '.' + fieldName;

      if (!selected[element]) {
        mainFields.push({
          as_name: asName,
          field_name: fieldName,
          element_name: asName + '.' + fieldName
        });
      }

      selected[element] = 1;
    });
  });

  Object.keys(item.filters).forEach(element => {
    let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
    let r = reg.exec(element);

    let asName = r[1];
    let fieldName = r[2];

    if (!selected[element]) {
      mainFields.push({
        as_name: asName,
        field_name: fieldName,
        element_name: asName + '.' + fieldName
      });
    }

    let fieldClass: enums.FieldClassEnum =
      asName === 'mf'
        ? item.model.fields.find(mField => mField.name === fieldName)
            .field_class
        : item.model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName).field_class;

    if (fieldClass === enums.FieldClassEnum.Measure) {
      selected[element] = 1;
    }
  });

  mainFields.forEach(mainField => {
    let asName = mainField.as_name;
    let fieldName = mainField.field_name;
    let element = mainField.element_name;

    let field =
      asName === 'mf'
        ? item.model.fields.find(mField => mField.name === fieldName)
        : item.model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;
    let sqlSelect;

    if (field.field_class === enums.FieldClassEnum.Dimension) {
      i++;

      if (asName === 'mf') {
        // remove ${ } on doubles (no singles exists in _real of model dimensions)
        sqlSelect = ApRegex.removeBracketsOnDoubles(field.sql_real);
      } else {
        sqlSelect = `${asName}.${fieldName}`;
      }

      if (selected[element]) {
        groupMainBy.push(`${i}`); // toString
      }
    } else if (field.field_class === enums.FieldClassEnum.Measure) {
      i++;

      if (asName === 'mf') {
        // remove ${ } on doubles (no singles exists in _real of model measures)
        sqlFinal = ApRegex.removeBracketsOnDoubles(field.sql_real);

        if (
          [
            enums.FieldExtTypeEnum.SumByKey,
            enums.FieldExtTypeEnum.AverageByKey,
            enums.FieldExtTypeEnum.MedianByKey,
            enums.FieldExtTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on doubles (no singles exists in _real of model measures)
          sqlKeyFinal = ApRegex.removeBracketsOnDoubles(field.sql_key_real);
        }
      } else {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlFinal = ApRegex.removeBracketsOnSinglesWithAlias(
          field.sql_real,
          asName
        );

        if (
          [
            enums.FieldExtTypeEnum.SumByKey,
            enums.FieldExtTypeEnum.AverageByKey,
            enums.FieldExtTypeEnum.MedianByKey,
            enums.FieldExtTypeEnum.PercentileByKey
          ].indexOf(field.type) > -1
        ) {
          // remove ${ } on singles (no doubles exists in _real of view measures)
          sqlKeyFinal = ApRegex.removeBracketsOnSinglesWithAlias(
            field.sql_key_real,
            asName
          );
        }
      }

      switch (true) {
        case field.type === enums.FieldExtTypeEnum.SumByKey: {
          if (item.connection === api.ProjectConnectionEnum.BigQuery) {
            item.main_udfs['mprove_array_sum'] = 1;
          }

          sqlSelect = gen.makeMeasureSumByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.AverageByKey: {
          if (item.connection === api.ProjectConnectionEnum.BigQuery) {
            item.main_udfs['mprove_array_sum'] = 1;
          }

          sqlSelect = gen.makeMeasureAverageByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.MedianByKey: {
          item.main_udfs['mprove_approx_percentile_distinct_disc'] = 1;

          sqlSelect = gen.makeMeasureMedianByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.PercentileByKey: {
          item.main_udfs['mprove_approx_percentile_distinct_disc'] = 1;

          sqlSelect = gen.makeMeasurePercentileByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            percentile: field.percentile,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.Min: {
          sqlSelect = gen.makeMeasureMin({
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.Max: {
          sqlSelect = gen.makeMeasureMax({
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.CountDistinct: {
          sqlSelect = gen.makeMeasureCountDistinct({
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.List: {
          sqlSelect = gen.makeMeasureList({
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.Custom: {
          sqlSelect = sqlFinal;
          break;
        }
      }
    } else if (field.field_class === enums.FieldClassEnum.Calculation) {
      if (asName === 'mf') {
        sqlFinal = ApRegex.removeBracketsOnCalculationSinglesMf(field.sql_real);
        sqlFinal = ApRegex.removeBracketsOnCalculationDoubles(sqlFinal);

        sqlSelect = sqlFinal;
      } else {
        sqlFinal = ApRegex.removeBracketsOnCalculationSinglesWithAlias(
          field.sql_real,
          asName
        );
        // no need to substitute doubles (they not exists in view fields)

        sqlSelect = sqlFinal;
      }
    }

    if (
      selected[element] &&
      field.field_class !== enums.FieldClassEnum.Calculation
    ) {
      mainText.push(`  ${sqlSelect} as ${asName}_${fieldName},`);
    }

    processedFields[element] = sqlSelect;
  });

  item.main_text = mainText;
  item.group_main_by = groupMainBy;
  item.main_fields = mainFields;
  item.selected = selected;
  item.processed_fields = processedFields;

  return item;
}
