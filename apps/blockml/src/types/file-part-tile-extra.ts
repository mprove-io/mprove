import type { AppliedGivenValue } from '#common/zod/blockml/applied-given-value';
import type { FilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export interface FilePartTileExtra extends FilePartTile {
  mconfigParentId: string;
  filePath: string;
  fileName: string;
  appliedGivens: Record<string, AppliedGivenValue>;
}
