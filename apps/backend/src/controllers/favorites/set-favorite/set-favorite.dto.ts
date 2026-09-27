import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetFavoriteRequest } from '#common/zod/backend/routes/favorites/set-favorite/set-favorite-request';
import { zToBackendSetFavoriteResponse } from '#common/zod/backend/routes/favorites/set-favorite/set-favorite-response';

export class ToBackendSetFavoriteRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetFavoriteRequest })
) {}

export class ToBackendSetFavoriteResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetFavoriteResponse })
) {}
