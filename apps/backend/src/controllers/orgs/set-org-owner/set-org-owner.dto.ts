import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetOrgOwnerRequest } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-request';
import { zToBackendSetOrgOwnerResponse } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-response';

export class ToBackendSetOrgOwnerRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgOwnerRequest })
) {}

export class ToBackendSetOrgOwnerResponseDto extends createBackendResponseDto({
  schema: zToBackendSetOrgOwnerResponse
}) {}
