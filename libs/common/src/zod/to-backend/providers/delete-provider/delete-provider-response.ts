import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendDeleteProviderResponseInfo,
  zToBackendDeleteProviderResponseInfo
} from './delete-provider-response-info';
import {
  type ToBackendDeleteProviderResponsePayload,
  zToBackendDeleteProviderResponsePayload
} from './delete-provider-response-payload';

export type ToBackendDeleteProviderResponse = Extend<
  MyResponse,
  {
    info: ToBackendDeleteProviderResponseInfo;
    payload: ToBackendDeleteProviderResponsePayload;
  }
>;

export let zToBackendDeleteProviderResponse = zMyResponse
  .extend({
    info: zToBackendDeleteProviderResponseInfo,
    payload: zToBackendDeleteProviderResponsePayload
  })
  .meta({ id: 'ToBackendDeleteProviderResponse' });

assertTypesEqual<
  ToBackendDeleteProviderResponse,
  z.infer<typeof zToBackendDeleteProviderResponse>
>({ value: true });
