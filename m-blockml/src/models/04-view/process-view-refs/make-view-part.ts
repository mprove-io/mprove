import { api } from '../../../barrels/api';
import { interfaces } from '../../../barrels/interfaces';
import { barSpecial } from '../../../barrels/bar-special';

export function makeViewPart(item: {
  topView: interfaces.View;
  parentViewName: string;
  needViewName: string;
  needViewAs: string;
  needViewFields: { [field: string]: number };
  view: interfaces.View;
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  structId: string;
}) {
  let sub = barSpecial.genSub({
    select: Object.keys(item.needViewFields),
    view: item.view,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    connection: item.connection,
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
