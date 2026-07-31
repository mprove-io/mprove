import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditProviderRequest,
  zToBackendEditProviderResponse
} from '#common/zod/to-backend/providers/to-backend-edit-provider';

export class ToBackendEditProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderRequest })
) {}

export class ToBackendEditProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderResponse })
) {}
