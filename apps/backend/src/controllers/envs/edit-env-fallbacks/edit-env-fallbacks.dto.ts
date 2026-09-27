import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditEnvFallbacksRequest } from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-request';
import { zToBackendEditEnvFallbacksResponse } from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-response';

export class ToBackendEditEnvFallbacksRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvFallbacksRequest })
) {}

export class ToBackendEditEnvFallbacksResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvFallbacksResponse })
) {}
