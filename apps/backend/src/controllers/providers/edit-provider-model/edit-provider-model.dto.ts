import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditProviderModelRequest,
  zToBackendEditProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-edit-provider-model';

export class ToBackendEditProviderModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderModelRequest })
) {}

export class ToBackendEditProviderModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderModelResponse })
) {}
