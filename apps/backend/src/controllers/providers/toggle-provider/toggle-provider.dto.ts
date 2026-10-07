import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendToggleProviderRequest } from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-request';
import { zToBackendToggleProviderResponse } from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-response';

export class ToBackendToggleProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendToggleProviderRequest })
) {}

export class ToBackendToggleProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendToggleProviderResponse }
) {}
