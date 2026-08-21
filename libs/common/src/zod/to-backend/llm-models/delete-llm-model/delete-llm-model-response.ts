import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendDeleteLlmModelResponseInfo,
  zToBackendDeleteLlmModelResponseInfo
} from './delete-llm-model-response-info';
import {
  type ToBackendDeleteLlmModelResponsePayload,
  zToBackendDeleteLlmModelResponsePayload
} from './delete-llm-model-response-payload';

export type ToBackendDeleteLlmModelResponse = Extend<
  MyResponse,
  {
    info: ToBackendDeleteLlmModelResponseInfo;
    payload: ToBackendDeleteLlmModelResponsePayload;
  }
>;

export let zToBackendDeleteLlmModelResponse = zMyResponse
  .extend({
    info: zToBackendDeleteLlmModelResponseInfo,
    payload: zToBackendDeleteLlmModelResponsePayload
  })
  .meta({ id: 'ToBackendDeleteLlmModelResponse' });

assertTypesEqual<
  ToBackendDeleteLlmModelResponse,
  z.infer<typeof zToBackendDeleteLlmModelResponse>
>({ value: true });
