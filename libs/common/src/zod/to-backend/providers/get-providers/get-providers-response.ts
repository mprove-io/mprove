import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendGetProvidersResponseInfo,
  zToBackendGetProvidersResponseInfo
} from './get-providers-response-info';
import {
  type ToBackendGetProvidersResponsePayload,
  zToBackendGetProvidersResponsePayload
} from './get-providers-response-payload';

export type ToBackendGetProvidersResponse = Extend<
  MyResponse,
  {
    info: ToBackendGetProvidersResponseInfo;
    payload: ToBackendGetProvidersResponsePayload;
  }
>;

export let zToBackendGetProvidersResponse = zMyResponse
  .extend({
    info: zToBackendGetProvidersResponseInfo,
    payload: zToBackendGetProvidersResponsePayload
  })
  .meta({ id: 'ToBackendGetProvidersResponse' });

assertTypesEqual<
  ToBackendGetProvidersResponse,
  z.infer<typeof zToBackendGetProvidersResponse>
>({ value: true });
