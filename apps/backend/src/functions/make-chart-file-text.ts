import * as path from 'path';
import { common } from '~backend/barrels/common';

export function makeChartFileText(item: {
  mconfig: common.MconfigX;
  chartId: string;
  tileTitle: string;
  roles: string;
  malloyChartFilePath: string;
  modelFilePath: string;
  modelId: string;
}) {
  let {
    mconfig,
    chartId,
    tileTitle,
    roles,
    malloyChartFilePath,
    modelFilePath,
    modelId
  } = item;

  let filePartTile: common.FilePartTile = common.prepareTile({
    isForDashboard: false,
    mconfig: mconfig
    // malloyQueryId: chartId
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

  let malloyFileText;

  let relativePath = path.relative(
    `/${path.dirname(malloyChartFilePath)}`,
    `/${modelFilePath}`
  );

  if (mconfig.modelType === common.ModelTypeEnum.Malloy) {
    malloyFileText = `import { ${modelId} } from '${relativePath}';

query: ${chartId} is ${mconfig.malloyQuery.substring(5)}
`;
  }

  return { chartFileText: chartFileText, malloyFileText: malloyFileText };
}
