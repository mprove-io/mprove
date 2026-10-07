import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
import { zToBackendLoginUserResponse } from '#common/types/backend/routes/users/login-user/login-user-response';

export class ToBackendLoginUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserRequest })
) {}

export class ToBackendLoginUserResponseDto extends createBackendResponseDto({
  schema: zToBackendLoginUserResponse
}) {}
