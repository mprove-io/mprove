import * as crypto from 'node:crypto';

export function makeDashboardFullId(item: {
  structId: string;
  dashboardId: string;
}): string {
  let { structId, dashboardId } = item;

  let text = structId + dashboardId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
