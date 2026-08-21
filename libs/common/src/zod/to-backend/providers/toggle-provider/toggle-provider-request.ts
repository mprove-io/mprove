import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendToggleProviderRequestInfo,
  zToBackendToggleProviderRequestInfo
} from './toggle-provider-request-info';
import {
  type ToBackendToggleProviderRequestPayload,
  zToBackendToggleProviderRequestPayload
} from './toggle-provider-request-payload';

export type ToBackendToggleProviderRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendToggleProviderRequestInfo;
    payload: ToBackendToggleProviderRequestPayload;
  }
>;

export let zToBackendToggleProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendToggleProviderRequestInfo,
    payload: zToBackendToggleProviderRequestPayload
  })
  .meta({ id: 'ToBackendToggleProviderRequest' });

assertTypesEqual<
  ToBackendToggleProviderRequest,
  z.infer<typeof zToBackendToggleProviderRequest>
>({ value: true });
