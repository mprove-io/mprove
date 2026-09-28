import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetOrgRequest } from '#common/zod/backend/routes/orgs/get-org/get-org-request';
import { zToBackendGetOrgResponse } from '#common/zod/backend/routes/orgs/get-org/get-org-response';

export class ToBackendGetOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgRequest })
) {}

export class ToBackendGetOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendGetOrgResponse
}) {}
