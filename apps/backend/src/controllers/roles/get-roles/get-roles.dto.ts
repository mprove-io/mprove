import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetRolesRequest } from '#common/types/backend/routes/roles/get-roles/get-roles-request';
import { zToBackendGetRolesResponse } from '#common/types/backend/routes/roles/get-roles/get-roles-response';

export class ToBackendGetRolesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRolesRequest })
) {}

export class ToBackendGetRolesResponseDto extends createBackendResponseDto({
  schema: zToBackendGetRolesResponse
}) {}
