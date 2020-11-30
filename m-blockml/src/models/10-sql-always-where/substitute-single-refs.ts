// import { ApRegex } from '../../barrels/am-regex';
// import { interfaces } from '../../barrels/interfaces';

// export function substituteSingleRefs(item: { models: interfaces.Model[] }) {
//   item.models.forEach(x => {
//     if (
//       typeof x.sql_always_where === 'undefined' ||
//       x.sql_always_where === null
//     ) {
//       return;
//     }

//     let sqlAlwaysWhereReal = x.sql_always_where;

//     let reg = ApRegex.CAPTURE_SINGLE_REF();
//     let r;

//     while ((r = reg.exec(sqlAlwaysWhereReal))) {
//       let reference = r[1];
//       let referenceField = x.fields.find(f => f.name === reference);

//       sqlAlwaysWhereReal = ApRegex.replaceSingleRefs(
//         sqlAlwaysWhereReal,
//         reference,
//         referenceField.sql
//       );
//     }

//     x.sql_always_where_real = sqlAlwaysWhereReal;
//   });

//   return item.models;
// }
