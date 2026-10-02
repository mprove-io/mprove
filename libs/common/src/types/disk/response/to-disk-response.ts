import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';
import type { ToDiskUnknownOperationResponse } from '#common/types/disk/response/to-disk-unknown-operation-response';

export type ToDiskResponse =
  | ToDiskResponseForOperation<ToDiskOperation>
  | ToDiskUnknownOperationResponse;
