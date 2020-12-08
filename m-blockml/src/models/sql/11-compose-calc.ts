// import { ApRegex } from '../../barrels/am-regex';
// import { enums } from '../../barrels/enums';
// import { interfaces } from '../../barrels/interfaces';
// import { applyFilter } from './apply-filter';

// export function composeCalc(item: interfaces.Vars) {
//   let calc: string[] = [];

//   calc = calc.concat(item.query);

//   calc.push(``);
//   calc.push(`SELECT`);

//   if (item.select.length === 0) {
//     calc.push(`    1 as no_fields_selected,`);
//   }

//   item.select.forEach(element => {
//     let r = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);

//     let asName = r[1];
//     let fieldName = r[2];

//     let field =
//       asName === 'mf'
//         ? item.model.fields.find(mField => mField.name === fieldName)
//         : item.model.joins
//             .find(j => j.as === asName)
//             .view.fields.find(vField => vField.name === fieldName);

//     let selectString =
//       field.field_class === enums.FieldClassEnum.Dimension
//         ? `  ${asName}_${fieldName},`
//         : field.field_class === enums.FieldClassEnum.Measure
//         ? `  ${asName}_${fieldName},`
//         : field.field_class === enums.FieldClassEnum.Calculation
//         ? `  ${item.processed_fields[element]} as ${asName}_${fieldName},`
//         : ``;

//     calc.push(selectString);
//   });

//   // chop
//   calc[calc.length - 1] = calc[calc.length - 1].slice(0, -1);

//   calc.push(`FROM model_main`);
//   calc.push(``);

//   if (
//     Object.keys(item.where_calc).length > 0 ||
//     (typeof item.model.sql_always_where_calc_real !== 'undefined' &&
//       item.model.sql_always_where_calc_real !== null)
//   ) {
//     calc.push(`WHERE`);

//     if (
//       typeof item.model.sql_always_where_calc_real !== 'undefined' &&
//       item.model.sql_always_where_calc_real !== null
//     ) {
//       let sqlAlwaysWhereCalcFinal = ApRegex.removeBracketsOnCalculationSinglesMf(
//         item.model.sql_always_where_calc_real
//       );

//       sqlAlwaysWhereCalcFinal = ApRegex.removeBracketsOnCalculationDoubles(
//         sqlAlwaysWhereCalcFinal
//       );

//       sqlAlwaysWhereCalcFinal = applyFilter(
//         item,
//         'mf',
//         sqlAlwaysWhereCalcFinal
//       );

//       calc.push(`  (${sqlAlwaysWhereCalcFinal})`);
//       calc.push(` AND`);
//     }

//     Object.keys(item.where_calc).forEach(element => {
//       if (item.where_calc[element].length > 0) {
//         calc = calc.concat(item.where_calc[element]);
//         calc.push(` AND`);
//       }
//     });

//     calc.pop();
//     calc.push(``);
//   }

//   if (item.sorts) {
//     let mySorts = item.sorts.split(',');

//     let orderBy: string[] = [];

//     mySorts.forEach(part => {
//       let r;

//       if ((r = ApRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G().exec(part))) {
//         let sorter = r[1];
//         let desc = r[2];

//         let index = item.select.findIndex(e => e === sorter);
//         let n = index + 1;

//         let eString = desc ? `${n} DESC` : `${n}`;

//         orderBy.push(eString);
//       }
//     });

//     let orderByString = orderBy.join(', ');

//     if (orderByString) {
//       calc.push(`ORDER BY ${orderByString}`);
//     }
//   }

//   calc.push(`LIMIT ${item.limit}`);

//   item.bqViews = [
//     {
//       bq_view_id: 'query',
//       sql: calc,
//       pdt_deps: Object.keys(item.query_pdt_deps),
//       pdt_deps_all: Object.keys(item.query_pdt_deps_all)
//     }
//   ];

//   return item;
// }
