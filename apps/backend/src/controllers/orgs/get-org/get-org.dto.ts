import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetOrgRequest } from '#common/types/backend/routes/orgs/get-org/get-org-request';
import { zToBackendGetOrgResponse } from '#common/types/backend/routes/orgs/get-org/get-org-response';

export class ToBackendGetOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgRequest })
) {}

export class ToBackendGetOrgResponseDto extends createBackendResponseDto({
  schema: zToBackendGetOrgResponse
}) {}
