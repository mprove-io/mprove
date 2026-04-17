import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetAvatarRequest,
  zToBackendSetAvatarResponse
} from '#common/zod/to-backend/avatars/to-backend-set-avatar';

export class ToBackendSetAvatarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetAvatarRequest })
) {}

export class ToBackendSetAvatarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetAvatarResponse })
) {}
