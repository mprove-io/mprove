import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetAvatarBigRequest,
  zToBackendGetAvatarBigResponse
} from '#common/zod/to-backend/avatars/to-backend-get-avatar-big';

export class ToBackendGetAvatarBigRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigRequest })
) {}

export class ToBackendGetAvatarBigResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetAvatarBigResponse })
) {}
