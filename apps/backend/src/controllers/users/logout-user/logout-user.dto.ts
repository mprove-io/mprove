import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendLogoutUserRequest } from '#common/types/backend/routes/users/logout-user/logout-user-request';
import { zToBackendLogoutUserResponse } from '#common/types/backend/routes/users/logout-user/logout-user-response';

export class ToBackendLogoutUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLogoutUserRequest })
) {}

export class ToBackendLogoutUserResponseDto extends createBackendResponseDto({
  schema: zToBackendLogoutUserResponse
}) {}
