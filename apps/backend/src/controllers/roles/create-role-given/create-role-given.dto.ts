import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateRoleGivenRequest } from '#common/zod/backend/routes/roles/create-role-given/create-role-given-request';
import { zToBackendCreateRoleGivenResponse } from '#common/zod/backend/routes/roles/create-role-given/create-role-given-response';

export class ToBackendCreateRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleGivenRequest })
) {}

export class ToBackendCreateRoleGivenResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateRoleGivenResponse }
) {}
