import type { SpaceFolder } from '#common/types/backend/space-folder';
import type { SpaceNodeX } from '#common/types/backend/space-node-x';

export type SpaceFolderX = SpaceFolder & {
  children: SpaceNodeX[];
  isMatched?: boolean;
  isSelectedAncestor?: boolean;
};
