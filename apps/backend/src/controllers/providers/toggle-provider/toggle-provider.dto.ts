import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendToggleProviderRequest } from '#common/zod/backend/routes/providers/toggle-provider/toggle-provider-request';
import { zToBackendToggleProviderResponse } from '#common/zod/backend/routes/providers/toggle-provider/toggle-provider-response';

export class ToBackendToggleProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendToggleProviderRequest })
) {}

export class ToBackendToggleProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendToggleProviderResponse })
) {}
