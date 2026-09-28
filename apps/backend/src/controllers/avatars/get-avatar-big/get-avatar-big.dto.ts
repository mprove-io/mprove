import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetAvatarBigRequest } from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-request';
import { zToBackendGetAvatarBigResponse } from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-response';

export class ToBackendGetAvatarBigRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigRequest })
) {}

export class ToBackendGetAvatarBigResponseDto extends createBackendResponseDto({
  schema: zToBackendGetAvatarBigResponse
}) {}
