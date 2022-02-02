import { common } from '~backend/barrels/common';

export function makeVizFileText(item: {
  mconfig: common.MconfigX;
  vizId: string;
  reportTitle: string;
  roles: string;
  users: string;
}) {
  let { mconfig, vizId, reportTitle, roles, users } = item;

  let rep = common.prepareReport({
    isForDashboard: false,
    mconfig: mconfig
  });

  rep.title = reportTitle;

  let vizFileText = common.toYaml({
    viz: vizId,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    access_users:
      common.isDefined(users) && users.trim().length > 0
        ? users.split(',').map(x => x.trim())
        : undefined,
    reports: [rep]
  });

  return vizFileText;
}
