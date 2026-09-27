import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendLoginUserRequest } from '#common/zod/backend/routes/users/login-user/login-user-request';
import { zToBackendLoginUserResponse } from '#common/zod/backend/routes/users/login-user/login-user-response';

export class ToBackendLoginUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserRequest })
) {}

export class ToBackendLoginUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserResponse })
) {}
