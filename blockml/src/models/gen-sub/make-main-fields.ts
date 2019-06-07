import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { gen } from '../../barrels/gen';
import { api } from '../../barrels/api';

export function makeMainFields(item: interfaces.VarsSub) {
  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: string[] = [];

  let selected: { [s: string]: number } = {};
  let processedFields: { [s: string]: string } = {};

  let i: number = 0;

  item.select.forEach(fieldName => {
    mainFields.push(fieldName);

    selected[fieldName] = 1;
  });

  Object.keys(item.dep_measures).forEach(fieldName => {
    if (!selected[fieldName]) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  Object.keys(item.dep_dimensions).forEach(fieldName => {
    if (!selected[fieldName]) {
      mainFields.push(fieldName);
    }

    selected[fieldName] = 1;
  });

  mainFields.forEach(fieldName => {
    let field = item.view.fields.find(vField => vField.name === fieldName);

    let sqlFinal;
    let sqlKeyFinal;
    let sqlSelect;

    if (field.field_class === enums.FieldClassEnum.Dimension) {
      i++;

      sqlSelect = fieldName;

      if (selected[fieldName]) {
        groupMainBy.push(`${i}`); // toString
      }
    } else if (field.field_class === enums.FieldClassEnum.Measure) {
      i++;

      // remove ${ } on singles (no doubles exists in _real of view measures)
      sqlFinal = ApRegex.removeBracketsOnSingles(field.sql_real);

      if (
        [
          enums.FieldExtTypeEnum.SumByKey,
          enums.FieldExtTypeEnum.AverageByKey,
          enums.FieldExtTypeEnum.MedianByKey,
          enums.FieldExtTypeEnum.PercentileByKey
        ].indexOf(field.type) > -1
      ) {
        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlKeyFinal = ApRegex.removeBracketsOnSingles(field.sql_key_real);
      }

      switch (true) {
        case field.type === enums.FieldExtTypeEnum.SumByKey: {
          if (item.connection === api.ProjectConnectionEnum.BigQuery) {
            item.extra_udfs['mprove_array_sum'] = 1;
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
            item.extra_udfs['mprove_array_sum'] = 1;
          }

          sqlSelect = gen.makeMeasureAverageByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.MedianByKey: {
          item.extra_udfs['mprove_approx_percentile_distinct_disc'] = 1;

          sqlSelect = gen.makeMeasureMedianByKey({
            sql_key_final: sqlKeyFinal,
            sql_final: sqlFinal,
            connection: item.connection
          });

          break;
        }

        case field.type === enums.FieldExtTypeEnum.PercentileByKey: {
          item.extra_udfs['mprove_approx_percentile_distinct_disc'] = 1;

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
      sqlFinal = ApRegex.removeBracketsOnCalculationSingles(field.sql_real);
      // no need to substitute doubles (they not exists in view fields)

      sqlSelect = sqlFinal;
    }

    if (
      selected[fieldName] &&
      field.field_class !== enums.FieldClassEnum.Calculation
    ) {
      mainText.push(`  ${sqlSelect} as ${fieldName},`);
    }

    processedFields[fieldName] = sqlSelect;
  });

  item.main_text = mainText;
  item.group_main_by = groupMainBy;
  item.main_fields = mainFields;
  item.selected = selected;
  item.processed_fields = processedFields;

  return item;
}
