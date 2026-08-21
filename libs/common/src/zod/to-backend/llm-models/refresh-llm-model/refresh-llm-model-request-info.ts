import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendRefreshLlmModelRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendRefreshLlmModel;
  }
>;

export let zToBackendRefreshLlmModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRefreshLlmModel)
  })
  .meta({ id: 'ToBackendRefreshLlmModelRequestInfo' });

assertTypesEqual<
  ToBackendRefreshLlmModelRequestInfo,
  z.infer<typeof zToBackendRefreshLlmModelRequestInfo>
>({ value: true });
