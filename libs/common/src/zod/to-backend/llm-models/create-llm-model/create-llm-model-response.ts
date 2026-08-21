import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendCreateLlmModelResponseInfo,
  zToBackendCreateLlmModelResponseInfo
} from './create-llm-model-response-info';
import {
  type ToBackendCreateLlmModelResponsePayload,
  zToBackendCreateLlmModelResponsePayload
} from './create-llm-model-response-payload';

export type ToBackendCreateLlmModelResponse = Extend<
  MyResponse,
  {
    info: ToBackendCreateLlmModelResponseInfo;
    payload: ToBackendCreateLlmModelResponsePayload;
  }
>;

export let zToBackendCreateLlmModelResponse = zMyResponse
  .extend({
    info: zToBackendCreateLlmModelResponseInfo,
    payload: zToBackendCreateLlmModelResponsePayload
  })
  .meta({ id: 'ToBackendCreateLlmModelResponse' });

assertTypesEqual<
  ToBackendCreateLlmModelResponse,
  z.infer<typeof zToBackendCreateLlmModelResponse>
>({ value: true });
