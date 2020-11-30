// import { ApRegex } from '../../barrels/am-regex';
// import { interfaces } from '../../barrels/interfaces';

// export function makeDoubleDepsAfterSingles(item: {
//   models: interfaces.Model[];
// }) {
//   item.models.forEach(x => {
//     x.sql_always_where_double_deps_after_singles = {};

//     if (
//       typeof x.sql_always_where === 'undefined' ||
//       x.sql_always_where === null
//     ) {
//       return;
//     }

//     let reg = ApRegex.CAPTURE_DOUBLE_REF_G();
//     let r;

//     while ((r = reg.exec(x.sql_always_where_real))) {
//       let asName: string = r[1];
//       let dep: string = r[2];

//       if (!x.sql_always_where_double_deps_after_singles[asName]) {
//         x.sql_always_where_double_deps_after_singles[asName] = {};
//       }

//       x.sql_always_where_double_deps_after_singles[asName][dep] = 1; // 1 from old logic
//     }
//   });

//   return item.models;
// }
