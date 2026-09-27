import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateRoleRequest } from '#common/zod/backend/routes/roles/create-role/create-role-request';
import { zToBackendCreateRoleResponse } from '#common/zod/backend/routes/roles/create-role/create-role-response';

export class ToBackendCreateRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleRequest })
) {}

export class ToBackendCreateRoleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleResponse })
) {}
