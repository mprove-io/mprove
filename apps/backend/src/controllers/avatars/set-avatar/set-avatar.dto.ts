import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetAvatarRequest } from '#common/zod/backend/routes/avatars/set-avatar/set-avatar-request';
import { zToBackendSetAvatarResponse } from '#common/zod/backend/routes/avatars/set-avatar/set-avatar-response';

export class ToBackendSetAvatarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetAvatarRequest })
) {}

export class ToBackendSetAvatarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetAvatarResponse })
) {}
