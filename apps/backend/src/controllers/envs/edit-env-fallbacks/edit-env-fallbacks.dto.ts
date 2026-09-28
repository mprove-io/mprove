import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditEnvFallbacksRequest } from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-request';
import { zToBackendEditEnvFallbacksResponse } from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-response';

export class ToBackendEditEnvFallbacksRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvFallbacksRequest })
) {}

export class ToBackendEditEnvFallbacksResponseDto extends createBackendResponseDto(
  { schema: zToBackendEditEnvFallbacksResponse }
) {}
