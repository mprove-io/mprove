import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateProviderRequest } from '#common/zod/backend/routes/providers/create-provider/create-provider-request';
import { zToBackendCreateProviderResponse } from '#common/zod/backend/routes/providers/create-provider/create-provider-response';

export class ToBackendCreateProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderRequest })
) {}

export class ToBackendCreateProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderResponse })
) {}
