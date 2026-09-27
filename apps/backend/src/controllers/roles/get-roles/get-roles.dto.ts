import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetRolesRequest } from '#common/zod/backend/routes/roles/get-roles/get-roles-request';
import { zToBackendGetRolesResponse } from '#common/zod/backend/routes/roles/get-roles/get-roles-response';

export class ToBackendGetRolesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRolesRequest })
) {}

export class ToBackendGetRolesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRolesResponse })
) {}
