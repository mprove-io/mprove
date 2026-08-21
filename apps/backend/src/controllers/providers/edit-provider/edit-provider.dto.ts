import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendEditProviderRequest } from '#common/zod/to-backend/providers/edit-provider/edit-provider-request';
import { zToBackendEditProviderResponse } from '#common/zod/to-backend/providers/edit-provider/edit-provider-response';

export class ToBackendEditProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderRequest })
) {}

export class ToBackendEditProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderResponse })
) {}
