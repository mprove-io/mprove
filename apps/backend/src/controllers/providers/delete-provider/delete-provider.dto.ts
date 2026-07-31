import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteProviderRequest,
  zToBackendDeleteProviderResponse
} from '#common/zod/to-backend/providers/to-backend-delete-provider';

export class ToBackendDeleteProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderRequest })
) {}

export class ToBackendDeleteProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderResponse })
) {}
