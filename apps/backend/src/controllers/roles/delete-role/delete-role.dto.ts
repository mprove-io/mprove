import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendDeleteRoleRequest,
  zToBackendDeleteRoleResponse
} from '#common/zod/to-backend/roles/to-backend-delete-role';

export class ToBackendDeleteRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleRequest })
) {}

export class ToBackendDeleteRoleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleResponse })
) {}
