import type { ToBlockmlRequest } from '#common/types/blockml/request/to-blockml-request';
import type { ToBlockmlResponseForOperation } from '#common/types/blockml/response/to-blockml-response-for-operation';

export type ToBlockmlResponseForRequest<TRequest extends ToBlockmlRequest> =
  ToBlockmlResponseForOperation<TRequest['operation']>;
