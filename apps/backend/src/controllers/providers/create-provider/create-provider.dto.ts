import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateProviderRequest } from '#common/types/backend/routes/providers/create-provider/create-provider-request';
import { zToBackendCreateProviderResponse } from '#common/types/backend/routes/providers/create-provider/create-provider-response';

export class ToBackendCreateProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateProviderRequest })
) {}

export class ToBackendCreateProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateProviderResponse }
) {}
