import { common } from '~backend/barrels/common';

export function makeChartFileText(item: {
  mconfig: common.MconfigX;
  chartId: string;
  tileTitle: string;
  roles: string;
  modelFilePath: string;
}) {
  let { mconfig, chartId, tileTitle, roles, modelFilePath } = item;

  let filePartTile: common.FilePartTile = common.prepareTile({
    isForDashboard: false,
    mconfig: mconfig,
    malloyQueryId: chartId
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

  let malloyQueryText;

  if (mconfig.modelType === common.ModelTypeEnum.Malloy) {
    malloyQueryText = `import '${modelFilePath.split('/').slice(1).join('/')}';

query: ${chartId} is ${mconfig.malloyQuery.substring(5)}
`;
  }

  return { chartFileText: chartFileText, malloyQueryText: malloyQueryText };
}
