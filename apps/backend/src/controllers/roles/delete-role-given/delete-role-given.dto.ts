import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteRoleGivenRequest } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-request';
import { zToBackendDeleteRoleGivenResponse } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-response';

export class ToBackendDeleteRoleGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRoleGivenRequest })
) {}

export class ToBackendDeleteRoleGivenResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteRoleGivenResponse }
) {}
