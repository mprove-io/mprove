import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendRefreshLlmModelResponseInfo,
  zToBackendRefreshLlmModelResponseInfo
} from './refresh-llm-model-response-info';
import {
  type ToBackendRefreshLlmModelResponsePayload,
  zToBackendRefreshLlmModelResponsePayload
} from './refresh-llm-model-response-payload';

export type ToBackendRefreshLlmModelResponse = Extend<
  MyResponse,
  {
    info: ToBackendRefreshLlmModelResponseInfo;
    payload: ToBackendRefreshLlmModelResponsePayload;
  }
>;

export let zToBackendRefreshLlmModelResponse = zMyResponse
  .extend({
    info: zToBackendRefreshLlmModelResponseInfo,
    payload: zToBackendRefreshLlmModelResponsePayload
  })
  .meta({ id: 'ToBackendRefreshLlmModelResponse' });

assertTypesEqual<
  ToBackendRefreshLlmModelResponse,
  z.infer<typeof zToBackendRefreshLlmModelResponse>
>({ value: true });
