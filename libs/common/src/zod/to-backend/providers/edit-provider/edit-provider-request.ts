import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendEditProviderRequestInfo,
  zToBackendEditProviderRequestInfo
} from './edit-provider-request-info';
import {
  type ToBackendEditProviderRequestPayload,
  zToBackendEditProviderRequestPayload
} from './edit-provider-request-payload';

export type ToBackendEditProviderRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendEditProviderRequestInfo;
    payload?: ToBackendEditProviderRequestPayload;
  }
>;

export let zToBackendEditProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendEditProviderRequestInfo,
    payload: zToBackendEditProviderRequestPayload
  })
  .meta({ id: 'ToBackendEditProviderRequest' });

assertTypesEqual<
  ToBackendEditProviderRequest,
  z.infer<typeof zToBackendEditProviderRequest>
>({ value: true });
