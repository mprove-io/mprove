import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateRoleGivenRequest } from '#common/types/backend/routes/roles/create-role-given/create-role-given-request';
import { zToBackendCreateRoleGivenResponse } from '#common/types/backend/routes/roles/create-role-given/create-role-given-response';

export class ToBackendCreateRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateRoleGivenRequest })
) {}

export class ToBackendCreateRoleGivenResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateRoleGivenResponse }
) {}
