import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/disk/response/to-disk-response-for-operation';
import type { ToDiskUnknownOperationResponse } from '#common/zod/disk/response/to-disk-unknown-operation-response';

export type ToDiskResponse =
  | ToDiskResponseForOperation<ToDiskOperation>
  | ToDiskUnknownOperationResponse;
