import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetOrgRequest } from '#common/zod/backend/routes/orgs/get-org/get-org-request';
import { zToBackendGetOrgResponse } from '#common/zod/backend/routes/orgs/get-org/get-org-response';

export class ToBackendGetOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgRequest })
) {}

export class ToBackendGetOrgResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgResponse })
) {}
