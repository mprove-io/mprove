import { common } from '~backend/barrels/common';

export function makeVizFileText(item: {
  mconfig: common.MconfigX;
  chartId: string;
  tileTitle: string;
  roles: string;
  users: string;
  defaultTimezone: string;
}) {
  let { mconfig, chartId, tileTitle, roles, users, defaultTimezone } = item;

  let filePartTile: common.FilePartTile = common.prepareTile({
    isForDashboard: false,
    mconfig: mconfig,
    defaultTimezone: defaultTimezone,
    deleteFilterFieldId: undefined,
    deleteFilterMconfigId: undefined
  });

  filePartTile.title = tileTitle;

  let vizFileText = common.toYaml({
    chart: chartId,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    access_users:
      common.isDefined(users) && users.trim().length > 0
        ? users.split(',').map(x => x.trim())
        : undefined,
    tiles: [filePartTile]
  });

  return vizFileText;
}
