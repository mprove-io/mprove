import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendRefreshLlmModelRequestInfo,
  zToBackendRefreshLlmModelRequestInfo
} from './refresh-llm-model-request-info';
import {
  type ToBackendRefreshLlmModelRequestPayload,
  zToBackendRefreshLlmModelRequestPayload
} from './refresh-llm-model-request-payload';

export type ToBackendRefreshLlmModelRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendRefreshLlmModelRequestInfo;
    payload: ToBackendRefreshLlmModelRequestPayload;
  }
>;

export let zToBackendRefreshLlmModelRequest = zToBackendRequest
  .extend({
    info: zToBackendRefreshLlmModelRequestInfo,
    payload: zToBackendRefreshLlmModelRequestPayload
  })
  .meta({ id: 'ToBackendRefreshLlmModelRequest' });

assertTypesEqual<
  ToBackendRefreshLlmModelRequest,
  z.infer<typeof zToBackendRefreshLlmModelRequest>
>({ value: true });
