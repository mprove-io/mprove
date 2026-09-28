import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendLoginUserRequest } from '#common/zod/backend/routes/users/login-user/login-user-request';
import { zToBackendLoginUserResponse } from '#common/zod/backend/routes/users/login-user/login-user-response';

export class ToBackendLoginUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserRequest })
) {}

export class ToBackendLoginUserResponseDto extends createBackendResponseDto({
  schema: zToBackendLoginUserResponse
}) {}
