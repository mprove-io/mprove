import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateRoleRequest } from '#common/types/backend/routes/roles/create-role/create-role-request';
import { zToBackendCreateRoleResponse } from '#common/types/backend/routes/roles/create-role/create-role-response';

export class ToBackendCreateRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleRequest })
) {}

export class ToBackendCreateRoleResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateRoleResponse
}) {}
