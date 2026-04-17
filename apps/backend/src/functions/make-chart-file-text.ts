import { prepareTile } from '#common/functions/prepare-tile';
import { toYaml } from '#common/functions/to-yaml';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { FilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export function makeChartFileText(item: {
  mconfig: MconfigX;
  chartId: string;
  tileTitle: string;
  modelFilePath: string;
  modelId: string;
}) {
  let { mconfig, chartId, tileTitle, modelFilePath, modelId } = item;

  let filePartTile: FilePartTile = prepareTile({
    isForDashboard: false,
    mconfig: mconfig
  });

  filePartTile.title = tileTitle;

  let chartFileText = toYaml({
    chart: chartId,
    tiles: [filePartTile]
  });

  return {
    chartFileText: chartFileText
  };
}
