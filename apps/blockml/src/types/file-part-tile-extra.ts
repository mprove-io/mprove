import type { AppliedGivenValue } from '#common/types/blockml/parts/applied-given-value';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';

export interface FilePartTileExtra extends FilePartTile {
  mconfigParentId: string;
  filePath: string;
  fileName: string;
  appliedGivens: Record<string, AppliedGivenValue>;
}
