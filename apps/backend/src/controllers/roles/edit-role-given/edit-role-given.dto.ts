import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditRoleGivenRequest } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-request';
import { zToBackendEditRoleGivenResponse } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-response';

export class ToBackendEditRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditRoleGivenRequest })
) {}

export class ToBackendEditRoleGivenResponseDto extends createBackendResponseDto(
  { schema: zToBackendEditRoleGivenResponse }
) {}
