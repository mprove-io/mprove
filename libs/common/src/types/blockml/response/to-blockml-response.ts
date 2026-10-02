import type { ToBlockmlOperation } from '#common/types/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseForOperation } from '#common/types/blockml/response/to-blockml-response-for-operation';
import type { ToBlockmlUnknownOperationResponse } from '#common/types/blockml/response/to-blockml-unknown-operation-response';

export type ToBlockmlResponse =
  | ToBlockmlResponseForOperation<ToBlockmlOperation>
  | ToBlockmlUnknownOperationResponse;
