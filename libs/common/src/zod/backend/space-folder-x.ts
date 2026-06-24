import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';

export type SpaceFolderX = SpaceFolder & {
  children: SpaceNodeX[];
  isMatched?: boolean;
  isSelectedAncestor?: boolean;
};
