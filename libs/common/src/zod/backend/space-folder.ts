import { z } from 'zod';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';

export let zSpaceFolder = z.object({
  type: z.literal('spaceFolder'),
  id: z.string(),
  space: z.string(),
  filePath: z.string(),
  title: z.string(),
  accessRoles: z.array(z.string()),
  accessRolesCombined: z.array(z.string()),
  isSynthetic: z.boolean(),
  modelId: z.string().nullish(),
  modelLabel: z.string().nullish(),
  get children() {
    return z.array(zSpaceNode);
  }
});

export type SpaceFolder = {
  type: 'spaceFolder';
  id: string;
  space: string;
  filePath: string;
  title: string;
  accessRoles: string[];
  accessRolesCombined: string[];
  isSynthetic: boolean;
  modelId?: string;
  modelLabel?: string;
  children: SpaceNode[];
};
