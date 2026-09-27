import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteRoleRequest } from '#common/zod/backend/routes/roles/delete-role/delete-role-request';
import { zToBackendDeleteRoleResponse } from '#common/zod/backend/routes/roles/delete-role/delete-role-response';

export class ToBackendDeleteRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleRequest })
) {}

export class ToBackendDeleteRoleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleResponse })
) {}
