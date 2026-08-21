import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendGetLlmModelPartsRequestInfo,
  zToBackendGetLlmModelPartsRequestInfo
} from './get-llm-model-parts-request-info';
import {
  type ToBackendGetLlmModelPartsRequestPayload,
  zToBackendGetLlmModelPartsRequestPayload
} from './get-llm-model-parts-request-payload';

export type ToBackendGetLlmModelPartsRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendGetLlmModelPartsRequestInfo;
    payload: ToBackendGetLlmModelPartsRequestPayload;
  }
>;

export let zToBackendGetLlmModelPartsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetLlmModelPartsRequestInfo,
    payload: zToBackendGetLlmModelPartsRequestPayload
  })
  .meta({ id: 'ToBackendGetLlmModelPartsRequest' });

assertTypesEqual<
  ToBackendGetLlmModelPartsRequest,
  z.infer<typeof zToBackendGetLlmModelPartsRequest>
>({ value: true });
