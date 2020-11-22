import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { getAsDeps } from './9-3-get-as-deps';
import { makeViewPart } from './9-4-make-view-part';

export function substituteViewRefsRecursive(item: {
  topView: interfaces.View;
  parentViewName: string;
  parentDeps: { [dep: string]: number };
  input: string;
  views: interfaces.View[];
  udfsDict: interfaces.UdfsDict;
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  projectId: string;
  structId: string;
}) {
  let input = item.input;

  // get as deps
  let asDeps: {
    [as: string]: {
      view_name: string;
      fields: { [field: string]: number };
    };
  } = getAsDeps(input);

  input = api.MyRegex.replaceViewRefs(input, item.parentViewName);
  input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

  Object.keys(asDeps).forEach(as => {
    let view = item.views.find(v => v.name === asDeps[as].view_name);

    let viewPart = makeViewPart({
      topView: item.topView,
      parentViewName: item.parentViewName,
      needViewName: asDeps[as].view_name,
      needViewAs: as,
      needViewFields: asDeps[as].fields,
      view: view,
      udfsDict: item.udfsDict,
      timezone: item.timezone,
      weekStart: item.weekStart,
      connection: item.connection,
      projectId: item.projectId,
      structId: item.structId
    });

    item.parentDeps[viewPart.name] = 1;

    item.topView.parts[viewPart.name] = {
      content: viewPart.content,
      contentPrepared: undefined,
      parentViewName: asDeps[as].view_name,
      deps: {}
    };

    input = [viewPart.content, input].join('\n\n');

    let newAsDeps: {
      [as: string]: {
        view_name: string;
        fields: { [field: string]: number };
      };
    } = getAsDeps(input);

    if (Object.keys(newAsDeps).length > 0) {
      input = this.substituteViewRefsRecursive({
        top_view: item.topView,
        parent_view_name: asDeps[as].view_name,
        parent_deps: item.topView.parts[viewPart.name].deps,
        input: input,
        views: item.views,
        udfs_dict: item.udfsDict,
        timezone: item.timezone,
        weekStart: item.weekStart,
        connection: item.connection,
        projectId: item.projectId,
        structId: item.structId
      });
    }
  });

  return input;
}
