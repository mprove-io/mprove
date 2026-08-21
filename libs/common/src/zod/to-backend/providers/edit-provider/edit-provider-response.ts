import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendEditProviderResponseInfo,
  zToBackendEditProviderResponseInfo
} from './edit-provider-response-info';
import {
  type ToBackendEditProviderResponsePayload,
  zToBackendEditProviderResponsePayload
} from './edit-provider-response-payload';

export type ToBackendEditProviderResponse = Extend<
  MyResponse,
  {
    info: ToBackendEditProviderResponseInfo;
    payload: ToBackendEditProviderResponsePayload;
  }
>;

export let zToBackendEditProviderResponse = zMyResponse
  .extend({
    info: zToBackendEditProviderResponseInfo,
    payload: zToBackendEditProviderResponsePayload
  })
  .meta({ id: 'ToBackendEditProviderResponse' });

assertTypesEqual<
  ToBackendEditProviderResponse,
  z.infer<typeof zToBackendEditProviderResponse>
>({ value: true });
