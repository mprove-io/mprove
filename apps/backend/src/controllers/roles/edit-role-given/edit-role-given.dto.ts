import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditRoleGivenRequest } from '#common/zod/backend/routes/roles/edit-role-given/edit-role-given-request';
import { zToBackendEditRoleGivenResponse } from '#common/zod/backend/routes/roles/edit-role-given/edit-role-given-response';

export class ToBackendEditRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditRoleGivenRequest })
) {}

export class ToBackendEditRoleGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditRoleGivenResponse })
) {}
