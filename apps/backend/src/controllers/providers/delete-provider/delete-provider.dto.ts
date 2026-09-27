import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteProviderRequest } from '#common/zod/backend/routes/providers/delete-provider/delete-provider-request';
import { zToBackendDeleteProviderResponse } from '#common/zod/backend/routes/providers/delete-provider/delete-provider-response';

export class ToBackendDeleteProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderRequest })
) {}

export class ToBackendDeleteProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderResponse })
) {}
