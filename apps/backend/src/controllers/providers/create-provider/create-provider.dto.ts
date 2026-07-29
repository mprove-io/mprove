import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateProviderRequest,
  zToBackendCreateProviderResponse
} from '#common/zod/to-backend/providers/to-backend-create-provider';

export class ToBackendCreateProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderRequest })
) {}

export class ToBackendCreateProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderResponse })
) {}
