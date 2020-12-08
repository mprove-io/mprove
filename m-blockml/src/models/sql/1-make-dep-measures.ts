// import { ApRegex } from '../../barrels/am-regex';
// import { enums } from '../../barrels/enums';
// import { interfaces } from '../../barrels/interfaces';

// export function makeDepMeasures(item: interfaces.Vars) {
//   let depMeasures: { [as: string]: { [dep: string]: number } } = {};

//   [...item.select, ...Object.keys(item.filters)].forEach(element => {
//     let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
//     let r = reg.exec(element);

//     let asName = r[1];
//     let fieldName = r[2];

//     // in model fields - only calculations can have fields_deps_after_singles
//     // we interested in calculation class now
//     if (asName === 'mf') {
//       let field = item.model.fields.find(mField => mField.name === fieldName);

//       if (field.field_class === enums.FieldClassEnum.Calculation) {
//         Object.keys(item.model.fields_deps_after_singles[fieldName]).forEach(
//           depName => {
//             let depModelField = item.model.fields.find(
//               mField => mField.name === depName
//             );

//             if (depModelField.field_class === enums.FieldClassEnum.Measure) {
//               if (!depMeasures[asName]) {
//                 depMeasures[asName] = {};
//               }
//               depMeasures[asName][depName] = 1;
//             }
//           }
//         );
//       }

//       Object.keys(
//         item.model.fields_double_deps_after_singles[fieldName]
//       ).forEach(alias => {
//         Object.keys(
//           item.model.fields_double_deps_after_singles[fieldName][alias]
//         ).forEach(depName => {
//           let join = item.model.joins.find(j => j.as === alias);

//           let depViewField = join.view.fields.find(
//             vField => vField.name === depName
//           );

//           if (depViewField.field_class === enums.FieldClassEnum.Measure) {
//             if (!depMeasures[alias]) {
//               depMeasures[alias] = {};
//             }
//             depMeasures[alias][depName] = 1;
//           }
//         });
//       });

//       // in view fields - calculations and measures can have fields_deps_after_singles
//       // we interested in calculation class now
//     } else {
//       let join = item.model.joins.find(j => j.as === asName);

//       let field = join.view.fields.find(vField => vField.name === fieldName);

//       if (field.field_class === enums.FieldClassEnum.Calculation) {
//         Object.keys(join.view.fields_deps_after_singles[fieldName]).forEach(
//           depName => {
//             let depViewField = join.view.fields.find(
//               vField => vField.name === depName
//             );

//             if (depViewField.field_class === enums.FieldClassEnum.Measure) {
//               if (!depMeasures[asName]) {
//                 depMeasures[asName] = {};
//               }
//               depMeasures[asName][depName] = 1;
//             }
//           }
//         );
//       }
//     }

//     // process sql_always_where_calc_deps_after_singles
//     if (item.model.sql_always_where_calc_deps_after_singles) {
//       Object.keys(item.model.sql_always_where_calc_deps_after_singles).forEach(
//         depName => {
//           let depModelField = item.model.fields.find(
//             mField => mField.name === depName
//           );

//           if (depModelField.field_class === enums.FieldClassEnum.Measure) {
//             if (!depMeasures['mf']) {
//               depMeasures['mf'] = {};
//             }
//             depMeasures['mf'][depName] = 1;
//           }
//         }
//       );
//     }

//     // process sql_always_where_calc_double_deps_after_substitutions
//     if (item.model.sql_always_where_calc_double_deps_after_substitutions) {
//       Object.keys(
//         item.model.sql_always_where_calc_double_deps_after_substitutions
//       ).forEach(alias => {
//         Object.keys(
//           item.model.sql_always_where_calc_double_deps_after_substitutions[
//             alias
//           ]
//         ).forEach(depName => {
//           let join = item.model.joins.find(j => j.as === alias);

//           let depViewField = join.view.fields.find(
//             vField => vField.name === depName
//           );

//           if (depViewField.field_class === enums.FieldClassEnum.Measure) {
//             if (!depMeasures[asName]) {
//               depMeasures[asName] = {};
//             }
//             depMeasures[asName][depName] = 1;
//           }
//         });
//       });
//     }
//   });

//   item.dep_measures = depMeasures;

//   return item;
// }
