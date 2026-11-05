import type { AppliedGivenValue } from '#common/types/backend/parts/given/applied-given-value';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { Extend } from '#common/types/extend';

export type FilePartTileExtra = Extend<
  FilePartTile,
  {
    mconfigParentId: string;
    filePath: string;
    fileName: string;
    appliedGivens: Record<string, AppliedGivenValue>;
  }
>;
