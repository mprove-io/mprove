import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteProviderModelRequest,
  zToBackendDeleteProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-delete-provider-model';

export class ToBackendDeleteProviderModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderModelRequest })
) {}

export class ToBackendDeleteProviderModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderModelResponse })
) {}
