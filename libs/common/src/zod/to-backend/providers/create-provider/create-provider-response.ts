import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToBackendCreateProviderResponseInfo,
  zToBackendCreateProviderResponseInfo
} from './create-provider-response-info';
import {
  type ToBackendCreateProviderResponsePayload,
  zToBackendCreateProviderResponsePayload
} from './create-provider-response-payload';

export type ToBackendCreateProviderResponse = Extend<
  MyResponse,
  {
    info: ToBackendCreateProviderResponseInfo;
    payload: ToBackendCreateProviderResponsePayload;
  }
>;

export let zToBackendCreateProviderResponse = zMyResponse
  .extend({
    info: zToBackendCreateProviderResponseInfo,
    payload: zToBackendCreateProviderResponsePayload
  })
  .meta({ id: 'ToBackendCreateProviderResponse' });

assertTypesEqual<
  ToBackendCreateProviderResponse,
  z.infer<typeof zToBackendCreateProviderResponse>
>({ value: true });
