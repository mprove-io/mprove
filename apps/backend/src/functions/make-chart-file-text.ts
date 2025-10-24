import { prepareTile } from '~common/functions/prepare-tile';
import { toYaml } from '~common/functions/to-yaml';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';

export function makeChartFileText(item: {
  mconfig: MconfigX;
  chartId: string;
  tileTitle: string;
  // roles: string;
  // malloyChartFilePath: string;
  modelFilePath: string;
  modelId: string;
}) {
  let {
    mconfig,
    chartId,
    tileTitle,
    // roles,
    // malloyChartFilePath,
    modelFilePath,
    modelId
  } = item;

  let filePartTile: FilePartTile = prepareTile({
    isForDashboard: false,
    mconfig: mconfig
    // malloyQueryId: chartId
  });

  filePartTile.title = tileTitle;

  let chartFileText = toYaml({
    chart: chartId,
    // access_roles:
    //   isDefined(roles) && roles.trim().length > 0
    //     ? roles.split(',').map(x => x.trim())
    //     : undefined,
    tiles: [filePartTile]
  });

  // let malloyFileText;

  // let relativePath = path.relative(
  //   `/${path.dirname(malloyChartFilePath)}`,
  //   `/${modelFilePath}`
  // );

  //   if (mconfig.modelType === ModelTypeEnum.Malloy) {
  //     malloyFileText = `import { ${modelId} } from '${relativePath}';

  // query: ${chartId} is ${mconfig.malloyQuery.substring(5)}
  // `;
  //   }

  return {
    chartFileText: chartFileText
    // malloyFileText: malloyFileText
  };
}
