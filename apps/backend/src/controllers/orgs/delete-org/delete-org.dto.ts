import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteOrgRequest } from '#common/types/backend/routes/orgs/delete-org/delete-org-request';
import { zToBackendDeleteOrgResponse } from '#common/types/backend/routes/orgs/delete-org/delete-org-response';

export class ToBackendDeleteOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteOrgRequest })
) {}

export class ToBackendDeleteOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteOrgResponse
}) {}
