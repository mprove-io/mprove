import { prepareTile } from '#common/functions/prepare-tile';
import { toYaml } from '#common/functions/to-yaml';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { FilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export function makeChartFileText(item: {
  mconfig: MconfigX;
  chartId: string;
  tileTitle: string;
  accessRoles: string[];
}) {
  let { mconfig, chartId, tileTitle, accessRoles } = item;

  let filePartTile: FilePartTile = prepareTile({
    isForDashboard: false,
    mconfig: mconfig
  });

  filePartTile.title = tileTitle;

  let chartFileText = toYaml({
    chart: chartId,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    tiles: [filePartTile]
  });

  return {
    chartFileText: chartFileText
  };
}
