import type { ToDiskOperationResponse } from '#common/zod/to-disk/to-disk-operation-response';
import type { ToDiskUnrouteableResponse } from '#common/zod/to-disk/to-disk-unrouteable-response';

export type ToDiskRpcResponse =
  | ToDiskOperationResponse
  | ToDiskUnrouteableResponse;
