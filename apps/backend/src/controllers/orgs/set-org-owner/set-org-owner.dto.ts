import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetOrgOwnerRequest } from '#common/zod/backend/routes/orgs/set-org-owner/set-org-owner-request';
import { zToBackendSetOrgOwnerResponse } from '#common/zod/backend/routes/orgs/set-org-owner/set-org-owner-response';

export class ToBackendSetOrgOwnerRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgOwnerRequest })
) {}

export class ToBackendSetOrgOwnerResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgOwnerResponse })
) {}
