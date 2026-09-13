import type { ToBlockmlRequest } from '#common/zod/blockml/request/to-blockml-request';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';

export type ToBlockmlResponseForRequest<TRequest extends ToBlockmlRequest> =
  ToBlockmlResponseForOperation<TRequest['operation']>;
