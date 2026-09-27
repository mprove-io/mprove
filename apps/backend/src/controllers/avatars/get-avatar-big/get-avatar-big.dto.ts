import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetAvatarBigRequest } from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-request';
import { zToBackendGetAvatarBigResponse } from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-response';

export class ToBackendGetAvatarBigRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigRequest })
) {}

export class ToBackendGetAvatarBigResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigResponse })
) {}
