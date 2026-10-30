import * as crypto from 'node:crypto';

export function makeReportFullId(item: {
  structId: string;
  reportId: string;
}): string {
  let { structId, reportId } = item;

  let text = structId + reportId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
