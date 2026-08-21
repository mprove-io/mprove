import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendDeleteProviderRequestInfo,
  zToBackendDeleteProviderRequestInfo
} from './delete-provider-request-info';
import {
  type ToBackendDeleteProviderRequestPayload,
  zToBackendDeleteProviderRequestPayload
} from './delete-provider-request-payload';

export type ToBackendDeleteProviderRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendDeleteProviderRequestInfo;
    payload: ToBackendDeleteProviderRequestPayload;
  }
>;

export let zToBackendDeleteProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteProviderRequestInfo,
    payload: zToBackendDeleteProviderRequestPayload
  })
  .meta({ id: 'ToBackendDeleteProviderRequest' });

assertTypesEqual<
  ToBackendDeleteProviderRequest,
  z.infer<typeof zToBackendDeleteProviderRequest>
>({ value: true });
