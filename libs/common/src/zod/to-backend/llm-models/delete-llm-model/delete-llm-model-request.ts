import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendDeleteLlmModelRequestInfo,
  zToBackendDeleteLlmModelRequestInfo
} from './delete-llm-model-request-info';
import {
  type ToBackendDeleteLlmModelRequestPayload,
  zToBackendDeleteLlmModelRequestPayload
} from './delete-llm-model-request-payload';

export type ToBackendDeleteLlmModelRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendDeleteLlmModelRequestInfo;
    payload: ToBackendDeleteLlmModelRequestPayload;
  }
>;

export let zToBackendDeleteLlmModelRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteLlmModelRequestInfo,
    payload: zToBackendDeleteLlmModelRequestPayload
  })
  .meta({ id: 'ToBackendDeleteLlmModelRequest' });

assertTypesEqual<
  ToBackendDeleteLlmModelRequest,
  z.infer<typeof zToBackendDeleteLlmModelRequest>
>({ value: true });
