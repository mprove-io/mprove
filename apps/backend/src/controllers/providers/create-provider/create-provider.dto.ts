import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateProviderRequest } from '#common/zod/backend/routes/providers/create-provider/create-provider-request';
import { zToBackendCreateProviderResponse } from '#common/zod/backend/routes/providers/create-provider/create-provider-response';

export class ToBackendCreateProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderRequest })
) {}

export class ToBackendCreateProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateProviderResponse }
) {}
