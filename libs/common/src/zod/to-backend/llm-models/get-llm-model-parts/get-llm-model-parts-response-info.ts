import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendGetLlmModelPartsResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts}`;
    method: 'POST';
  }
>;

export let zToBackendGetLlmModelPartsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetLlmModelPartsResponseInfo' });

assertTypesEqual<
  ToBackendGetLlmModelPartsResponseInfo,
  z.infer<typeof zToBackendGetLlmModelPartsResponseInfo>
>({ value: true });
