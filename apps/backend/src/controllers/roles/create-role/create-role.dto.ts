import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendCreateRoleRequest,
  zToBackendCreateRoleResponse
} from '#common/zod/to-backend/roles/to-backend-create-role';

export class ToBackendCreateRoleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleRequest })
) {}

export class ToBackendCreateRoleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleResponse })
) {}
