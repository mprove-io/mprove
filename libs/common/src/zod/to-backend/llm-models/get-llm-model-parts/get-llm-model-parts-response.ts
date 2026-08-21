import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendGetLlmModelPartsResponseInfo,
  zToBackendGetLlmModelPartsResponseInfo
} from './get-llm-model-parts-response-info';
import {
  type ToBackendGetLlmModelPartsResponsePayload,
  zToBackendGetLlmModelPartsResponsePayload
} from './get-llm-model-parts-response-payload';

export type ToBackendGetLlmModelPartsResponse = Extend<
  MyResponse,
  {
    info: ToBackendGetLlmModelPartsResponseInfo;
    payload: ToBackendGetLlmModelPartsResponsePayload;
  }
>;

export let zToBackendGetLlmModelPartsResponse = zMyResponse
  .extend({
    info: zToBackendGetLlmModelPartsResponseInfo,
    payload: zToBackendGetLlmModelPartsResponsePayload
  })
  .meta({ id: 'ToBackendGetLlmModelPartsResponse' });

assertTypesEqual<
  ToBackendGetLlmModelPartsResponse,
  z.infer<typeof zToBackendGetLlmModelPartsResponse>
>({ value: true });
