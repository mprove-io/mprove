// import { interfaces } from '../../barrels/interfaces';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { AmError } from '../../barrels/am-error';

// export function processPdtTriggerSqlTableId(item: { pdts: interfaces.Pdt[] }) {
//   let pdtViewNames = item.pdts.map(x => x.view);

//   item.pdts
//     .filter(x => x.pdt_trigger_sql)
//     .map(x => {
//       let input = x.pdt_trigger_sql;

//       let tableIdViews: { [key: string]: number } = {};

//       let reg = ApRegex.CAPTURE_PDT_TABLE_ID();
//       let r;

//       while ((r = reg.exec(input))) {
//         let view: string = r[1];

//         if (pdtViewNames.indexOf(view) < 0) {
//           // error e292
//           ErrorsCollector.addError(
//             new AmError({
//               title: `pdt_trigger_sql PDT_TABLE_ID references missing pdt`,
//               message: `pdt_trigger_sql contains reference to "${view}", that is not valid pdt`,
//               lines: [
//                 {
//                   line: x.pdt_trigger_sql_line_num,
//                   name: x.file,
//                   path: x.path
//                 }
//               ]
//             })
//           );
//           x.pdt_trigger_sql = undefined;
//           x.pdt_trigger_time = undefined;
//           return;
//         }

//         tableIdViews[view] = 1;
//       }

//       if (x.pdt_trigger_sql) {
//         Object.keys(tableIdViews).forEach(view => {
//           let pdt = item.pdts.find(p => p.view === view);

//           x.pdt_trigger_sql = ApRegex.replacePdtTableId(
//             x.pdt_trigger_sql,
//             view,
//             pdt.name
//           );
//         });
//       }

//       return x;
//     });

//   return item.pdts;
// }
