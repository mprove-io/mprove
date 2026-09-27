import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetOrgInfoRequest } from '#common/zod/backend/routes/orgs/set-org-info/set-org-info-request';
import { zToBackendSetOrgInfoResponse } from '#common/zod/backend/routes/orgs/set-org-info/set-org-info-response';

export class ToBackendSetOrgInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgInfoRequest })
) {}

export class ToBackendSetOrgInfoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgInfoResponse })
) {}
