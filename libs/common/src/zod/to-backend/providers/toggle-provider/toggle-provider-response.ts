import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendToggleProviderResponseInfo,
  zToBackendToggleProviderResponseInfo
} from './toggle-provider-response-info';
import {
  type ToBackendToggleProviderResponsePayload,
  zToBackendToggleProviderResponsePayload
} from './toggle-provider-response-payload';

export type ToBackendToggleProviderResponse = Extend<
  MyResponse,
  {
    info: ToBackendToggleProviderResponseInfo;
    payload: ToBackendToggleProviderResponsePayload;
  }
>;

export let zToBackendToggleProviderResponse = zMyResponse
  .extend({
    info: zToBackendToggleProviderResponseInfo,
    payload: zToBackendToggleProviderResponsePayload
  })
  .meta({ id: 'ToBackendToggleProviderResponse' });

assertTypesEqual<
  ToBackendToggleProviderResponse,
  z.infer<typeof zToBackendToggleProviderResponse>
>({ value: true });
