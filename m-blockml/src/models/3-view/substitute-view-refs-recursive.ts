// import { ApRegex } from '../../barrels/am-regex';
// import { api } from '../../barrels/api';
// import { interfaces } from '../../barrels/interfaces';
// import { getAsDeps } from './get-as-deps';
// import { makeViewPart } from './make-view-part';

// export function substituteViewRefsRecursive(item: {
//   top_view: interfaces.View;
//   parent_view_name: string;
//   parent_deps: { [dep: string]: number };
//   input: string;
//   views: interfaces.View[];
//   udfs_dict: interfaces.UdfsDict;
//   timezone: string;
//   weekStart: api.ProjectWeekStartEnum;
//   connection: api.ProjectConnectionEnum;
//   bqProject: string;
//   projectId: string;
//   structId: string;
// }) {
//   let input = item.input;

//   // get as deps
//   let asDeps: {
//     [as: string]: {
//       view_name: string;
//       fields: { [field: string]: number };
//     };
//   } = getAsDeps({ input: input });

//   input = ApRegex.replaceViewRefs(input, item.parent_view_name);
//   input = ApRegex.removeBracketsOnViewFieldRefs(input);

//   Object.keys(asDeps).forEach(as => {
//     let view = item.views.find(v => v.name === asDeps[as].view_name);

//     let viewPart = makeViewPart({
//       top_view: item.top_view,
//       parent_view_name: item.parent_view_name,
//       need_view_name: asDeps[as].view_name,
//       need_view_as: as,
//       need_view_fields: asDeps[as].fields,
//       view: view,
//       udfs_dict: item.udfs_dict,
//       timezone: item.timezone,
//       weekStart: item.weekStart,
//       connection: item.connection,
//       bqProject: item.bqProject,
//       projectId: item.projectId,
//       structId: item.structId
//     });

//     item.parent_deps[viewPart.name] = 1;

//     item.top_view.parts[viewPart.name] = {
//       content: viewPart.content,
//       content_prepared: undefined,
//       parent_view_name: asDeps[as].view_name,
//       deps: {}
//     };

//     input = [viewPart.content, input].join(`\n\n`);

//     let newAsDeps: {
//       [as: string]: {
//         view_name: string;
//         fields: { [field: string]: number };
//       };
//     } = getAsDeps({ input: input });

//     if (Object.keys(newAsDeps).length > 0) {
//       input = this.substituteViewRefsRecursive({
//         top_view: item.top_view,
//         parent_view_name: asDeps[as].view_name,
//         parent_deps: item.top_view.parts[viewPart.name].deps,
//         input: input,
//         views: item.views,
//         udfs_dict: item.udfs_dict,
//         timezone: item.timezone,
//         weekStart: item.weekStart,
//         connection: item.connection,
//         bqProject: item.bqProject,
//         projectId: item.projectId,
//         structId: item.structId
//       });
//     }
//   });

//   return input;
// }
