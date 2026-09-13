import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlRequestForOperation } from '#common/zod/blockml/request/to-blockml-request-for-operation';

export type ToBlockmlRequest = ToBlockmlRequestForOperation<ToBlockmlOperation>;
