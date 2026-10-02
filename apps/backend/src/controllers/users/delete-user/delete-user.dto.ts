import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteUserRequest } from '#common/types/backend/routes/users/delete-user/delete-user-request';
import { zToBackendDeleteUserResponse } from '#common/types/backend/routes/users/delete-user/delete-user-response';

export class ToBackendDeleteUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserRequest })
) {}

export class ToBackendDeleteUserResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteUserResponse
}) {}
