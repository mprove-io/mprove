import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteUserRequest } from '#common/zod/backend/routes/users/delete-user/delete-user-request';
import { zToBackendDeleteUserResponse } from '#common/zod/backend/routes/users/delete-user/delete-user-response';

export class ToBackendDeleteUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserRequest })
) {}

export class ToBackendDeleteUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserResponse })
) {}
