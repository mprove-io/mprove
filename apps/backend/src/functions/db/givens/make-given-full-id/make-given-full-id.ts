import * as crypto from 'node:crypto';

export function makeGivenFullId(item: {
  projectId: string;
  givenId: string;
}): string {
  let { projectId, givenId } = item;

  let text = projectId + givenId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
