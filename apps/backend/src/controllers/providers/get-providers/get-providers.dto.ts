import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetProvidersRequest } from '#common/types/backend/routes/providers/get-providers/get-providers-request';
import { zToBackendGetProvidersResponse } from '#common/types/backend/routes/providers/get-providers/get-providers-response';

export class ToBackendGetProvidersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProvidersRequest })
) {}

export class ToBackendGetProvidersResponseDto extends createBackendResponseDto({
  schema: zToBackendGetProvidersResponse
}) {}
