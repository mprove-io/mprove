import type { ToBlockmlOperation } from '#common/types/blockml/request/to-blockml-operation';
import type { ToBlockmlRequestForOperation } from '#common/types/blockml/request/to-blockml-request-for-operation';

export type ToBlockmlRequest = ToBlockmlRequestForOperation<ToBlockmlOperation>;
