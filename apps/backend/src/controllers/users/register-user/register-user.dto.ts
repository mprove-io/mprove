import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRegisterUserRequest } from '#common/types/backend/routes/users/register-user/register-user-request';
import { zToBackendRegisterUserResponse } from '#common/types/backend/routes/users/register-user/register-user-response';

export class ToBackendRegisterUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRegisterUserRequest })
) {}

export class ToBackendRegisterUserResponseDto extends createBackendResponseDto({
  schema: zToBackendRegisterUserResponse
}) {}
