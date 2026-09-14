import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendGetRolesRequest,
  zToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';

export class ToBackendGetRolesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRolesRequest })
) {}

export class ToBackendGetRolesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRolesResponse })
) {}
