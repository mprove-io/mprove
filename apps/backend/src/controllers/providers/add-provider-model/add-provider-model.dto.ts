import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendAddProviderModelRequest,
  zToBackendAddProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-add-provider-model';

export class ToBackendAddProviderModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendAddProviderModelRequest })
) {}

export class ToBackendAddProviderModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendAddProviderModelResponse })
) {}
