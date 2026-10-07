import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSetOrgInfoRequest } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-request';
import { zToBackendSetOrgInfoResponse } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-response';

export class ToBackendSetOrgInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgInfoRequest })
) {}

export class ToBackendSetOrgInfoResponseDto extends createBackendResponseDto({
  schema: zToBackendSetOrgInfoResponse
}) {}
