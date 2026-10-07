import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditProviderRequest } from '#common/types/backend/routes/providers/edit-provider/edit-provider-request';
import { zToBackendEditProviderResponse } from '#common/types/backend/routes/providers/edit-provider/edit-provider-response';

export class ToBackendEditProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditProviderRequest })
) {}

export class ToBackendEditProviderResponseDto extends createBackendResponseDto({
  schema: zToBackendEditProviderResponse
}) {}
