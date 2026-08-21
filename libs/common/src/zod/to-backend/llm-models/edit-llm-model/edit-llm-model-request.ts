import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendEditLlmModelRequestInfo,
  zToBackendEditLlmModelRequestInfo
} from './edit-llm-model-request-info';
import {
  type ToBackendEditLlmModelRequestPayload,
  zToBackendEditLlmModelRequestPayload
} from './edit-llm-model-request-payload';

export type ToBackendEditLlmModelRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendEditLlmModelRequestInfo;
    payload: ToBackendEditLlmModelRequestPayload;
  }
>;

export let zToBackendEditLlmModelRequest = zToBackendRequest
  .extend({
    info: zToBackendEditLlmModelRequestInfo,
    payload: zToBackendEditLlmModelRequestPayload
  })
  .meta({ id: 'ToBackendEditLlmModelRequest' });

assertTypesEqual<
  ToBackendEditLlmModelRequest,
  z.infer<typeof zToBackendEditLlmModelRequest>
>({ value: true });
