import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteOrgRequest } from '#common/types/backend/routes/orgs/delete-org/delete-org-request';
import { zToBackendDeleteOrgResponse } from '#common/types/backend/routes/orgs/delete-org/delete-org-response';

export class ToBackendDeleteOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteOrgRequest })
) {}

export class ToBackendDeleteOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteOrgResponse
}) {}
