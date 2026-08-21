import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequest,
  zToBackendRequest
} from '#common/zod/to-backend/to-backend-request';
import {
  type ToBackendGetProvidersRequestInfo,
  zToBackendGetProvidersRequestInfo
} from './get-providers-request-info';
import {
  type ToBackendGetProvidersRequestPayload,
  zToBackendGetProvidersRequestPayload
} from './get-providers-request-payload';

export type ToBackendGetProvidersRequest = Extend<
  ToBackendRequest,
  {
    info: ToBackendGetProvidersRequestInfo;
    payload: ToBackendGetProvidersRequestPayload;
  }
>;

export let zToBackendGetProvidersRequest = zToBackendRequest
  .extend({
    info: zToBackendGetProvidersRequestInfo,
    payload: zToBackendGetProvidersRequestPayload
  })
  .meta({ id: 'ToBackendGetProvidersRequest' });

assertTypesEqual<
  ToBackendGetProvidersRequest,
  z.infer<typeof zToBackendGetProvidersRequest>
>({ value: true });
