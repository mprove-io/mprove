import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRegisterUserRequest } from '#common/zod/backend/routes/users/register-user/register-user-request';
import { zToBackendRegisterUserResponse } from '#common/zod/backend/routes/users/register-user/register-user-response';

export class ToBackendRegisterUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRegisterUserRequest })
) {}

export class ToBackendRegisterUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRegisterUserResponse })
) {}
