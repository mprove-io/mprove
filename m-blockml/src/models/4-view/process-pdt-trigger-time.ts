// import { interfaces } from '../../barrels/interfaces';
// import { ApRegex } from '../../barrels/am-regex';
// import { ErrorsCollector } from '../../barrels/errors-collector';
// import { AmError } from '../../barrels/am-error';
// let cron = require('cron');

// export function processPdtTriggerTime(item: { pdts: interfaces.Pdt[] }) {
//   item.pdts
//     .filter(x => x.pdt_trigger_time)
//     .map(x => {
//       let hasError = false;

//       if (
//         !x.pdt_trigger_time.match(ApRegex.FIVE_ELEMENTS_SEPARATED_BY_SPACES())
//       ) {
//         // error e295
//         ErrorsCollector.addError(
//           new AmError({
//             title: `pdt_trigger_time wrong cron elements`,
//             message: `pdt_trigger_time must have exactly 5 cron elements separated by spaces`,
//             lines: [
//               {
//                 line: x.pdt_trigger_time_line_num,
//                 name: x.file,
//                 path: x.path
//               }
//             ]
//           })
//         );
//         hasError = true;
//       }

//       if (hasError === false) {
//         x.pdt_trigger_time = '0 ' + x.pdt_trigger_time;

//         try {
//           let cronJob = new cron.CronJob(x.pdt_trigger_time, () => {});
//         } catch (err) {
//           // error e294
//           ErrorsCollector.addError(
//             new AmError({
//               title: `pdt_trigger_time wrong cron expression`,
//               message: `${err.message}`,
//               lines: [
//                 {
//                   line: x.pdt_trigger_time_line_num,
//                   name: x.file,
//                   path: x.path
//                 }
//               ]
//             })
//           );
//           hasError = true;
//         }
//       }

//       if (hasError === true) {
//         x.pdt_trigger_sql = undefined;
//         x.pdt_trigger_time = undefined;
//       }

//       return x;
//     });

//   return item.pdts;
// }
