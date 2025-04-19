import { common } from '~backend/barrels/common';

export function makeChartFileText(item: {
  mconfig: common.MconfigX;
  chartId: string;
  tileTitle: string;
  roles: string;
}) {
  let { mconfig, chartId, tileTitle, roles } = item;

  let filePartTile: common.FilePartTile = common.prepareTile({
    isForDashboard: false,
    mconfig: mconfig,
    deleteFilterFieldId: undefined,
    deleteFilterTileTitle: undefined
  });

  filePartTile.title = tileTitle;

  let chartFileText = common.toYaml({
    chart: chartId,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    tiles: [filePartTile]
  });

  return chartFileText;
}
