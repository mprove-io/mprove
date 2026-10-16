import type { RebuildStructStatelessError } from '#common/types/blockml/function-errors/rebuild-struct-stateless-error';
import type { GetMproveDirError } from '#common/types/node-common/function-errors/get-mprove-dir-error';

export type RebuildStructFromDirError =
  | GetMproveDirError
  | RebuildStructStatelessError;
