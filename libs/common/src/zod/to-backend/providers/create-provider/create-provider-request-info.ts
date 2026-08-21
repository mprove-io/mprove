import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendCreateProviderRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendCreateProvider;
  }
>;

export let zToBackendCreateProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateProvider)
  })
  .meta({ id: 'ToBackendCreateProviderRequestInfo' });

assertTypesEqual<
  ToBackendCreateProviderRequestInfo,
  z.infer<typeof zToBackendCreateProviderRequestInfo>
>({ value: true });
