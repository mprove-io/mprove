import { api } from '../../../barrels/api';
import { interfaces } from '../../../barrels/interfaces';
import { getAsDeps } from './get-as-deps';
import { makeViewPart } from './make-view-part';

export function substituteViewRefsRecursive(item: {
  topView: interfaces.View;
  parentViewName: string;
  parentDeps: { [dep: string]: number };
  input: string;
  views: interfaces.View[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  projectId: string;
  structId: string;
}) {
  let input = item.input;

  let asDeps: interfaces.View['asDeps'] = getAsDeps(input);

  input = api.MyRegex.replaceViewRefs(input, item.parentViewName);
  input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

  Object.keys(asDeps).forEach(as => {
    let view = item.views.find(v => v.name === asDeps[as].viewName);

    let viewPart = makeViewPart({
      topView: item.topView,
      parentViewName: item.parentViewName,
      needViewName: asDeps[as].viewName,
      needViewAs: as,
      needViewFields: asDeps[as].fieldNames,
      view: view,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      connection: item.connection,
      projectId: item.projectId,
      structId: item.structId
    });

    item.parentDeps[viewPart.name] = 1;

    item.topView.parts[viewPart.name] = {
      content: viewPart.content,
      contentPrepared: undefined,
      parentViewName: asDeps[as].viewName,
      deps: {}
    };

    input = [viewPart.content, input].join('\n\n');

    let newAsDeps: interfaces.View['asDeps'] = getAsDeps(input);

    if (Object.keys(newAsDeps).length > 0) {
      input = substituteViewRefsRecursive({
        topView: item.topView,
        parentViewName: asDeps[as].viewName,
        parentDeps: item.topView.parts[viewPart.name].deps,
        input: input,
        views: item.views,
        udfsDict: item.udfsDict,
        weekStart: item.weekStart,
        connection: item.connection,
        projectId: item.projectId,
        structId: item.structId
      });
    }
  });

  return input;
}
