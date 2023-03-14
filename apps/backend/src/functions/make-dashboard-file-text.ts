import { common } from '~backend/barrels/common';

export function makeDashboardFileText(item: {
  dashboard: common.DashboardX;
  newDashboardId: string;
  newTitle: string;
  // group: string;
  roles: string;
  users: string;
  defaultTimezone: string;
  deleteFilterFieldId: string;
  deleteFilterMconfigId: string;
}) {
  let {
    dashboard,
    newDashboardId,
    newTitle,
    roles,
    users,
    defaultTimezone,
    deleteFilterFieldId,
    deleteFilterMconfigId
  } = item;

  let fields = dashboard.fields.map(field => ({
    filter: field.id,
    hidden:
      common.isDefined(field.hidden) &&
      field.hidden !== common.DASHBOARD_FIELD_DEFAULT_HIDDEN
        ? field.hidden
        : undefined,
    label:
      common.isDefined(field.label) &&
      field.label.toUpperCase() !==
        common.MyRegex.replaceUnderscoresWithSpaces(field.id).toUpperCase()
        ? field.label
        : undefined,
    description:
      common.isDefined(field.description) && field.description !== ''
        ? field.description
        : undefined,
    result: field.result,
    default:
      common.isDefined(field.fractions) && field.fractions.length > 0
        ? field.fractions.map(x => x.brick)
        : undefined
  }));

  let reps = dashboard.reports.map(x => {
    let newMconfig = common.makeCopy(x.mconfig);

    // if (common.isDefined(x.listen)) {
    //   Object.keys(x.listen).forEach(y => {
    //     let dashboardFieldName = x.listen[y];

    //     if (fields.findIndex(f => f.filter === dashboardFieldName) < 0) {
    //       delete x.listen[y];
    //     }
    //   });
    // }

    return common.prepareReport({
      report: x,
      isForDashboard: true,
      mconfig: newMconfig,
      defaultTimezone: defaultTimezone,
      deleteFilterFieldId: deleteFilterFieldId,
      deleteFilterMconfigId: deleteFilterMconfigId
    });
  });

  let dashboardFileText = common.toYaml({
    dashboard: newDashboardId,
    title: common.isDefined(newTitle) ? newTitle.trim() : undefined,
    description: common.isDefined(dashboard.description)
      ? dashboard.description
      : undefined,
    // group:
    //   common.isDefined(group) && group.trim().length > 0
    //     ? group.trim()
    //     : undefined,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    access_users:
      common.isDefined(users) && users.trim().length > 0
        ? users.split(',').map(x => x.trim())
        : undefined,
    fields: common.isDefined(fields) && fields.length > 0 ? fields : undefined,
    reports: common.isDefined(reps) && reps.length > 0 ? reps : undefined
  });

  return dashboardFileText;
}
