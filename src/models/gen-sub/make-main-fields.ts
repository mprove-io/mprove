import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeMainFields(item: interfaces.VarsSub) {

  let mainText: string[] = [];
  let groupMainBy: string[] = [];
  let mainFields: string[] = [];

  let selected: { [s: string]: number } = {}; // поля которые должны быть в main селекте
  let processedFields: { [s: string]: string } = {};

  let i: number = 0; // номер поля в селекте для group by

  // добавляем в mainFields поля выбранные пользователем по порядку
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


  // набираем селект
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

      if ([
        enums.FieldExtTypeEnum.SumByKey,
        enums.FieldExtTypeEnum.AverageByKey,
        enums.FieldExtTypeEnum.MedianByKey,
        enums.FieldExtTypeEnum.PercentileByKey,
      ].indexOf(field.type) > -1) {

        // remove ${ } on singles (no doubles exists in _real of view measures)
        sqlKeyFinal = ApRegex.removeBracketsOnSingles(field.sql_key_real);
      }

      switch (true) {

        case field.type === enums.FieldExtTypeEnum.SumByKey: {
          item.extra_udfs['mprove_array_sum'] = 1;

          sqlSelect = `COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(`
            + sqlKeyFinal
            + ` AS STRING), '||'), CAST(`
            + sqlFinal
            + ` AS STRING)))), 0)`;

          break;
        }

        case field.type === enums.FieldExtTypeEnum.AverageByKey: {
          item.extra_udfs['mprove_array_sum'] = 1;

          let numerator = `mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(`
            + sqlKeyFinal
            + ` AS STRING), '||'), CAST(`
            + sqlFinal
            + ` AS STRING))))`;

          let denominator = `NULLIF(CAST(COUNT(DISTINCT CASE WHEN `
            + sqlFinal
            + ` IS NOT NULL THEN `
            + sqlKeyFinal
            + ` ELSE NULL END) AS FLOAT64), 0.0)`;

          sqlSelect = `(${numerator} / ${denominator})`;

          break;
        }

        case field.type === enums.FieldExtTypeEnum.MedianByKey: {
          item.extra_udfs['mprove_approx_percentile_distinct_disc'] = 1;

          sqlSelect = `mprove_approx_percentile_distinct_disc(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(`
            + sqlKeyFinal
            + ` AS STRING), '||'), CAST(`
            + sqlFinal
            + ` AS STRING))), 0.5)`;
          break;
        }

        case field.type === enums.FieldExtTypeEnum.PercentileByKey: {
          item.extra_udfs['mprove_approx_percentile_distinct_disc'] = 1;

          sqlSelect = `mprove_approx_percentile_distinct_disc(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(`
            + sqlKeyFinal
            + ` AS STRING), '||'), CAST(`
            + sqlFinal
            + ` AS STRING))), `
            + Number(field.percentile) / 100
            + `)`;
          break;
        }

        case field.type === enums.FieldExtTypeEnum.Min: {
          sqlSelect = `MIN(${sqlFinal})`;
          break;
        }

        case field.type === enums.FieldExtTypeEnum.Max: {
          sqlSelect = `MAX(${sqlFinal})`;
          break;
        }

        case field.type === enums.FieldExtTypeEnum.CountDistinct: {
          sqlSelect = `COUNT(DISTINCT ${sqlFinal})`;
          break;
        }

        case field.type === enums.FieldExtTypeEnum.List: {
          sqlSelect = `STRING_AGG(DISTINCT CAST(${sqlFinal} AS STRING), ', ')`;
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

    if (selected[fieldName] && field.field_class !== enums.FieldClassEnum.Calculation) {
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
