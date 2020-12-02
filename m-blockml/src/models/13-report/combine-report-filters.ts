// import { interfaces } from '../../barrels/interfaces';

// export function combineReportFilters(item: {
//   dashboards: interfaces.Dashboard[];
// }) {
//   item.dashboards.forEach(x => {
//     x.reports.forEach(report => {
//       Object.keys(report.listen).forEach(filter => {
//         let listen = report.listen[filter];

//         let dashFilter = Object.keys(x.filters).find(f => f === listen);

//         report.filters[filter] = JSON.parse(
//           JSON.stringify(x.filters[dashFilter])
//         );
//       });
//     });
//   });

//   return item.dashboards;
// }
