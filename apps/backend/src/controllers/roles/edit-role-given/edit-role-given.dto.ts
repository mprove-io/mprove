import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendEditRoleGivenRequest,
  zToBackendEditRoleGivenResponse
} from '#common/zod/to-backend/roles/to-backend-edit-role-given';

export class ToBackendEditRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditRoleGivenRequest })
) {}

export class ToBackendEditRoleGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditRoleGivenResponse })
) {}
