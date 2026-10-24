import * as crypto from 'node:crypto';

export function makeChartFullId(item: {
  structId: string;
  chartId: string;
}): string {
  let { structId, chartId } = item;

  let text = structId + chartId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
