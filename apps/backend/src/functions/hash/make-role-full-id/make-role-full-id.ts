import * as crypto from 'node:crypto';

export function makeRoleFullId(item: {
  projectId: string;
  roleId: string;
}): string {
  let { projectId, roleId } = item;

  let text = projectId + roleId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
