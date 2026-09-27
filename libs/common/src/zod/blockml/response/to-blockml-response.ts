import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';
import type { ToBlockmlUnknownOperationResponse } from '#common/zod/blockml/response/to-blockml-unknown-operation-response';

export type ToBlockmlResponse =
  | ToBlockmlResponseForOperation<ToBlockmlOperation>
  | ToBlockmlUnknownOperationResponse;
