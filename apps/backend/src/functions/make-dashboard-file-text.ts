import { common } from '~backend/barrels/common';

export function makeDashboardFileText(item: {
  dashboard: common.DashboardX;
  newDashboardId: string;
  newTitle: string;
  // group: string;
  roles: string;
  users: string;
  deleteFilterFieldId: string;
  deleteFilterTileTitle: string;
}) {
  let {
    dashboard,
    newDashboardId,
    newTitle,
    roles,
    users,
    deleteFilterFieldId,
    deleteFilterTileTitle
  } = item;

  let dashboardFile: common.FileDashboard = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
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
    parameters:
      common.isDefined(dashboard.fields) && dashboard.fields.length > 0
        ? dashboard.fields.map(field => ({
            filter: field.id,
            hidden:
              common.isDefined(field.hidden) &&
              field.hidden !== common.DASHBOARD_FIELD_DEFAULT_HIDDEN
                ? <any>field.hidden
                : undefined,
            label:
              common.isDefined(field.label) &&
              field.label.toUpperCase() !==
                common.MyRegex.replaceUnderscoresWithSpaces(
                  field.id
                ).toUpperCase()
                ? field.label
                : undefined,
            description:
              common.isDefined(field.description) && field.description !== ''
                ? field.description
                : undefined,
            result: field.result,
            suggest_model_dimension: field.suggestModelDimension,
            conditions:
              common.isDefined(field.fractions) && field.fractions.length > 0
                ? field.fractions.map(x => x.brick)
                : undefined
          }))
        : undefined,
    tiles:
      common.isDefined(dashboard.tiles) && dashboard.tiles.length > 0
        ? dashboard.tiles.map(x => {
            let newMconfig = common.makeCopy(x.mconfig);

            // if (common.isDefined(x.listen)) {
            //   Object.keys(x.listen).forEach(y => {
            //     let dashboardFieldName = x.listen[y];

            //     if (fields.findIndex(f => f.filter === dashboardFieldName) < 0) {
            //       delete x.listen[y];
            //     }
            //   });
            // }

            let filePartTile: common.FilePartTile = common.prepareTile({
              tile: x,
              isForDashboard: true,
              mconfig: newMconfig,
              deleteFilterFieldId: deleteFilterFieldId,
              deleteFilterTileTitle: deleteFilterTileTitle
            });

            return filePartTile;
          })
        : undefined
  };

  let dashboardFileText = common.toYaml(dashboardFile);

  return dashboardFileText;
}
