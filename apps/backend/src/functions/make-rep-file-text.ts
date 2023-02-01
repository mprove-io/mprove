import { common } from '~backend/barrels/common';

export function makeRepFileText(item: {
  repId: string;
  title: string;
  accessRoles: string[];
  accessUsers: string[];
  rows: common.Row[];
}) {
  let { repId, title, rows, accessRoles, accessUsers } = item;

  let repFileText = common.toYaml({
    report: repId,
    title: title,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    access_users:
      accessUsers.length > 0 ? accessUsers.map(x => x.trim()) : undefined,
    rows: rows.map(x => {
      let row = {
        id: x.rowId,
        metric: x.metricId,
        params:
          common.isDefined(x.params) && x.params.length > 0
            ? x.params
            : undefined
      };

      return row;
    })
  });

  return repFileText;
}
