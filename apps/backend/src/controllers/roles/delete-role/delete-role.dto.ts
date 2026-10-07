import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteRoleRequest } from '#common/types/backend/routes/roles/delete-role/delete-role-request';
import { zToBackendDeleteRoleResponse } from '#common/types/backend/routes/roles/delete-role/delete-role-response';

export class ToBackendDeleteRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleRequest })
) {}

export class ToBackendDeleteRoleResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteRoleResponse
}) {}
