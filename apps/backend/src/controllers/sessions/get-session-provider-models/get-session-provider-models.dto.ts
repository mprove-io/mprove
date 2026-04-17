import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetSessionProviderModelsRequest,
  zToBackendGetSessionProviderModelsResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session-provider-models';

export class ToBackendGetSessionProviderModelsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionProviderModelsRequest })
) {}

export class ToBackendGetSessionProviderModelsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionProviderModelsResponse })
) {}
