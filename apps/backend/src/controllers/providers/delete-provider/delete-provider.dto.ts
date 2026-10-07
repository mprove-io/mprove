import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteProviderRequest } from '#common/types/backend/routes/providers/delete-provider/delete-provider-request';
import { zToBackendDeleteProviderResponse } from '#common/types/backend/routes/providers/delete-provider/delete-provider-response';

export class ToBackendDeleteProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderRequest })
) {}

export class ToBackendDeleteProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteProviderResponse }
) {}
