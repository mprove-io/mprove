import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateOrgRequest } from '#common/types/backend/routes/orgs/create-org/create-org-request';
import { zToBackendCreateOrgResponse } from '#common/types/backend/routes/orgs/create-org/create-org-response';

export class ToBackendCreateOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateOrgRequest })
) {}

export class ToBackendCreateOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateOrgResponse
}) {}
