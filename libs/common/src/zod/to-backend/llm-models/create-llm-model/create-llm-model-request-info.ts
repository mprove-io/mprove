import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendCreateLlmModelRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel;
  }
>;

export let zToBackendCreateLlmModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel)
  })
  .meta({ id: 'ToBackendCreateLlmModelRequestInfo' });

assertTypesEqual<
  ToBackendCreateLlmModelRequestInfo,
  z.infer<typeof zToBackendCreateLlmModelRequestInfo>
>({ value: true });
