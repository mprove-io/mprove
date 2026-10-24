import * as crypto from 'node:crypto';

export function makeMetricFullId(item: {
  structId: string;
  metricId: string;
}): string {
  let { structId, metricId } = item;

  let text = structId + metricId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
