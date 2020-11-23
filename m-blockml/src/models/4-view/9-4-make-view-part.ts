import { barSub } from '../../barrels/bar-sub';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { genSub } from './9-5-gen-sub';

export function makeViewPart(item: {
  topView: interfaces.View;
  parentViewName: string;
  needViewName: string;
  needViewAs: string;
  needViewFields: { [field: string]: number };
  view: interfaces.View;
  udfsDict: interfaces.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  projectId: string;
  structId: string;
}) {
  let sub = genSub({
    select: Object.keys(item.needViewFields),
    view: item.view,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    connection: item.connection,
    projectId: item.projectId,
    structId: item.structId
  });

  Object.keys(sub.extraUdfs).forEach(udfName => {
    if (item.topView.udfs.indexOf(udfName) < 0) {
      item.topView.udfs.push(udfName);
    }
  });

  let name = `${item.parentViewName}__${item.needViewName}__${item.needViewAs}`;

  let lines: string[] = [];

  lines.push(`  ${name} AS (`);

  lines.push(sub.query.map((s: string) => `    ${s}`).join('\n'));

  lines.push('  ),');

  let content = lines.join('\n');

  return { name: name, content: content };
}
