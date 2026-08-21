import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendCreateProviderRequestInfo,
  zToBackendCreateProviderRequestInfo
} from './create-provider-request-info';
import {
  type ToBackendCreateProviderRequestPayload,
  zToBackendCreateProviderRequestPayload
} from './create-provider-request-payload';

export type ToBackendCreateProviderRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendCreateProviderRequestInfo;
    payload?: ToBackendCreateProviderRequestPayload;
  }
>;

export let zToBackendCreateProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateProviderRequestInfo,
    payload: zToBackendCreateProviderRequestPayload
  })
  .meta({ id: 'ToBackendCreateProviderRequest' });

assertTypesEqual<
  ToBackendCreateProviderRequest,
  z.infer<typeof zToBackendCreateProviderRequest>
>({ value: true });
