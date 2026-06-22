import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetFavoriteRequest,
  zToBackendSetFavoriteResponse
} from '#common/zod/to-backend/favorites/to-backend-set-favorite';

export class ToBackendSetFavoriteRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetFavoriteRequest })
) {}

export class ToBackendSetFavoriteResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetFavoriteResponse })
) {}
