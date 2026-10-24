import * as crypto from 'node:crypto';

export function makeModelFieldLeafFullId(item: {
  structId: string;
  modelId: string;
  fieldId: string;
}): string {
  let { structId, modelId, fieldId } = item;

  let text = structId + modelId + fieldId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
