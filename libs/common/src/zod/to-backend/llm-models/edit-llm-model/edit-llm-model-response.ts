import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendEditLlmModelResponseInfo,
  zToBackendEditLlmModelResponseInfo
} from './edit-llm-model-response-info';
import {
  type ToBackendEditLlmModelResponsePayload,
  zToBackendEditLlmModelResponsePayload
} from './edit-llm-model-response-payload';

export type ToBackendEditLlmModelResponse = Extend<
  MyResponse,
  {
    info: ToBackendEditLlmModelResponseInfo;
    payload: ToBackendEditLlmModelResponsePayload;
  }
>;

export let zToBackendEditLlmModelResponse = zMyResponse
  .extend({
    info: zToBackendEditLlmModelResponseInfo,
    payload: zToBackendEditLlmModelResponsePayload
  })
  .meta({ id: 'ToBackendEditLlmModelResponse' });

assertTypesEqual<
  ToBackendEditLlmModelResponse,
  z.infer<typeof zToBackendEditLlmModelResponse>
>({ value: true });
