import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendDeleteRoleGivenRequest,
  zToBackendDeleteRoleGivenResponse
} from '#common/zod/to-backend/roles/to-backend-delete-role-given';

export class ToBackendDeleteRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleGivenRequest })
) {}

export class ToBackendDeleteRoleGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleGivenResponse })
) {}
