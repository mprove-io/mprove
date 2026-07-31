import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendToggleProviderRequest,
  zToBackendToggleProviderResponse
} from '#common/zod/to-backend/providers/to-backend-toggle-provider';

export class ToBackendToggleProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendToggleProviderRequest })
) {}

export class ToBackendToggleProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendToggleProviderResponse })
) {}
