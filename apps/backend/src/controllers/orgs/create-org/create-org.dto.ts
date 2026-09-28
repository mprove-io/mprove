import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateOrgRequest } from '#common/zod/backend/routes/orgs/create-org/create-org-request';
import { zToBackendCreateOrgResponse } from '#common/zod/backend/routes/orgs/create-org/create-org-response';

export class ToBackendCreateOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateOrgRequest })
) {}

export class ToBackendCreateOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateOrgResponse
}) {}
