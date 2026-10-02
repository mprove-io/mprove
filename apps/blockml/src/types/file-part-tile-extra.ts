import type { AppliedGivenValue } from '#common/types/blockml/applied-given-value';
import type { FilePartTile } from '#common/types/blockml/internal/file-part-tile';

export interface FilePartTileExtra extends FilePartTile {
  mconfigParentId: string;
  filePath: string;
  fileName: string;
  appliedGivens: Record<string, AppliedGivenValue>;
}
