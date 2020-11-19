// import { ApRegex } from '../../barrels/am-regex';

// export function getAsDeps(item: { input: string }) {
//   // if returns nothing then view deleted in makeViewDeps

//   let input = item.input;

//   let asDeps: {
//     [as: string]: {
//       view_name: string;
//       fields: { [field: string]: number };
//     };
//   } = {};

//   let reg = ApRegex.CAPTURE_VIEW_REF_G();
//   let r;

//   while ((r = reg.exec(input))) {
//     let view: string = r[1];
//     let alias: string = r[2];

//     if (!asDeps[alias]) {
//       asDeps[alias] = { view_name: view, fields: {} };
//     }
//   }

//   let reg2 = ApRegex.CAPTURE_DOUBLE_REF_G();
//   let r2;

//   while ((r2 = reg2.exec(input))) {
//     let as: string = r2[1];
//     let dep: string = r2[2];

//     asDeps[as].fields[dep] = 1;
//   }

//   return asDeps;
// }
