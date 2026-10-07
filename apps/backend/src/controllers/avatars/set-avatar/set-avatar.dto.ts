import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSetAvatarRequest } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-request';
import { zToBackendSetAvatarResponse } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-response';

export class ToBackendSetAvatarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetAvatarRequest })
) {}

export class ToBackendSetAvatarResponseDto extends createBackendResponseDto({
  schema: zToBackendSetAvatarResponse
}) {}
