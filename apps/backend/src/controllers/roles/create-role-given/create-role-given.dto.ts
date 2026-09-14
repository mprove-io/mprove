import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendCreateRoleGivenRequest,
  zToBackendCreateRoleGivenResponse
} from '#common/zod/to-backend/roles/to-backend-create-role-given';

export class ToBackendCreateRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleGivenRequest })
) {}

export class ToBackendCreateRoleGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleGivenResponse })
) {}
