import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetAvatarBigRequest } from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-request';
import { zToBackendGetAvatarBigResponse } from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-response';

export class ToBackendGetAvatarBigRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigRequest })
) {}

export class ToBackendGetAvatarBigResponseDto extends createBackendResponseDto({
  schema: zToBackendGetAvatarBigResponse
}) {}
