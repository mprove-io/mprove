import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditProviderRequest } from '#common/zod/backend/routes/providers/edit-provider/edit-provider-request';
import { zToBackendEditProviderResponse } from '#common/zod/backend/routes/providers/edit-provider/edit-provider-response';

export class ToBackendEditProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderRequest })
) {}

export class ToBackendEditProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderResponse })
) {}
