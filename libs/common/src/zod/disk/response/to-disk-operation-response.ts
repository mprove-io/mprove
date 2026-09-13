import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/disk/response/to-disk-response-for-operation';

export type ToDiskOperationResponse =
  ToDiskResponseForOperation<ToDiskOperation>;
