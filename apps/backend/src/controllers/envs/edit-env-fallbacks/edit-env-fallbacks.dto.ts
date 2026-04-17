import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditEnvFallbacksRequest,
  zToBackendEditEnvFallbacksResponse
} from '#common/zod/to-backend/envs/to-backend-edit-env-fallbacks';

export class ToBackendEditEnvFallbacksRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvFallbacksRequest })
) {}

export class ToBackendEditEnvFallbacksResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvFallbacksResponse })
) {}
