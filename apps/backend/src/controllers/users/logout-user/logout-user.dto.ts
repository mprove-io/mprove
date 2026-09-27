import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendLogoutUserRequest } from '#common/zod/backend/routes/users/logout-user/logout-user-request';
import { zToBackendLogoutUserResponse } from '#common/zod/backend/routes/users/logout-user/logout-user-response';

export class ToBackendLogoutUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLogoutUserRequest })
) {}

export class ToBackendLogoutUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLogoutUserResponse })
) {}
