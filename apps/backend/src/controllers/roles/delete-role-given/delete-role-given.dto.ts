import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteRoleGivenRequest } from '#common/zod/backend/routes/roles/delete-role-given/delete-role-given-request';
import { zToBackendDeleteRoleGivenResponse } from '#common/zod/backend/routes/roles/delete-role-given/delete-role-given-response';

export class ToBackendDeleteRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleGivenRequest })
) {}

export class ToBackendDeleteRoleGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleGivenResponse })
) {}
