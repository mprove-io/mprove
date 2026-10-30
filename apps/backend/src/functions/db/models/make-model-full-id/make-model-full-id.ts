import * as crypto from 'node:crypto';

export function makeModelFullId(item: {
  structId: string;
  modelId: string;
}): string {
  let { structId, modelId } = item;

  let text = structId + modelId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
