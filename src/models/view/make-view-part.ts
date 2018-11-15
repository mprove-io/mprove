import { api } from '../../barrels/api';
import { genSub } from '../../barrels/gen-sub';
import { interfaces } from '../../barrels/interfaces';

export function makeViewPart(item: {
  top_view: interfaces.View;
  parent_view_name: string;
  need_view_name: string;
  need_view_as: string;
  need_view_fields: { [field: string]: number };
  view: interfaces.View;
  udfs_dict: interfaces.UdfsDict;
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  bqProject: string;
  projectId: string;
  structId: string;
}) {
  let sub = genSub.genSub({
    select: Object.keys(item.need_view_fields),
    view: item.view,
    udfs_dict: item.udfs_dict,
    timezone: item.timezone,
    weekStart: item.weekStart,
    bqProject: item.bqProject,
    projectId: item.projectId,
    structId: item.structId
  });

  Object.keys(sub.extra_udfs).forEach(udfName => {
    if (item.top_view.udfs.indexOf(udfName) < 0) {
      item.top_view.udfs.push(udfName);
    }
  });

  let name = `${item.parent_view_name}__${item.need_view_name}__${
    item.need_view_as
  }`;

  let lines: string[] = [];

  lines.push(`  ${name} AS (`);

  lines.push(sub.query.map(s => `    ${s}`).join(`\n`));

  lines.push(`  ),`);

  let content = lines.join(`\n`);

  return { name: name, content: content };
}
