import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendCreateLlmModelRequestInfo,
  zToBackendCreateLlmModelRequestInfo
} from './create-llm-model-request-info';
import {
  type ToBackendCreateLlmModelRequestPayload,
  zToBackendCreateLlmModelRequestPayload
} from './create-llm-model-request-payload';

export type ToBackendCreateLlmModelRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendCreateLlmModelRequestInfo;
    payload: ToBackendCreateLlmModelRequestPayload;
  }
>;

export let zToBackendCreateLlmModelRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateLlmModelRequestInfo,
    payload: zToBackendCreateLlmModelRequestPayload
  })
  .meta({ id: 'ToBackendCreateLlmModelRequest' });

assertTypesEqual<
  ToBackendCreateLlmModelRequest,
  z.infer<typeof zToBackendCreateLlmModelRequest>
>({ value: true });
